import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useServiceWorker() {
    const [showUpdate, setShowUpdate] = useState(false)

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
        }
    }, [needRefresh])

    function applyUpdate() {
        updateServiceWorker(true)
    }

    function dismissUpdate() {
        setShowUpdate(false)
    }

    return { showUpdate, applyUpdate, dismissUpdate }
}
