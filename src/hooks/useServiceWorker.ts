import { useEffect, useState, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useServiceWorker() {
    const [showUpdate, setShowUpdate] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState(false)

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
            // Check for updates every 60 seconds
            if (registration) {
                setInterval(() => {
                    registration.update()
                }, 60 * 1000)
            }
        },
        onRegisterError(_error: Error) {
            // Silently handle registration errors
        },
    })

    useEffect(() => {
        if (needRefresh) {
            setShowUpdate(true)
            setUpdateAvailable(true)
        }
    }, [needRefresh])

    // Listen for controller change (new SW taking over) and force reload
    useEffect(() => {
        let refreshing = false
        const onControllerChange = () => {
            if (!refreshing) {
                refreshing = true
                window.location.reload()
            }
        }
        navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)
        return () => {
            navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
        }
    }, [])

    const applyUpdate = useCallback(() => {
        updateServiceWorker(true)
        // Fallback: if controllerchange doesn't fire within 3s, force reload
        setTimeout(() => {
            window.location.reload()
        }, 3000)
    }, [updateServiceWorker])

    function dismissUpdate() {
        setShowUpdate(false)
        // updateAvailable stays true so settings menu can still trigger it
    }

    return { showUpdate, updateAvailable, applyUpdate, dismissUpdate }
}
