import { initializeApp } from 'firebase/app'
import { initializeAnalytics, isSupported, type Analytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Only initialize if we have the config (prevents crashes if someone clones without .env)
const isConfigured = Boolean(firebaseConfig.apiKey)

export const app = isConfigured ? initializeApp(firebaseConfig) : null

/**
 * Analytics is initialized asynchronously to support iOS PWA.
 * iOS Safari standalone mode applies ITP (Intelligent Tracking Prevention)
 * which blocks default third-party cookies. Using initializeAnalytics with
 * explicit cookie config ensures first-party cookies that work everywhere.
 */
let _analytics: Analytics | null = null
const _analyticsReady: Promise<Analytics | null> = (async () => {
    if (!app) return null
    try {
        const supported = await isSupported()
        if (!supported) return null
        _analytics = initializeAnalytics(app, {
            config: {
                cookie_domain: window.location.hostname,
                cookie_flags: 'SameSite=Lax;Secure',
                cookie_prefix: '_tl',
                send_page_view: true,
            }
        })
        return _analytics
    } catch {
        return null
    }
})()

/** Returns the analytics instance (may be null if not ready yet) */
export function getAnalyticsInstance(): Analytics | null {
    return _analytics
}

/** Returns a promise that resolves when analytics is ready */
export function waitForAnalytics(): Promise<Analytics | null> {
    return _analyticsReady
}
