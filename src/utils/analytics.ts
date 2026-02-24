import { logEvent, setUserProperties, setUserId } from 'firebase/analytics'
import { getAnalyticsInstance, waitForAnalytics } from './firebase'

// ── Helpers ───────────────────────────────────────────────────────

function detectOS(): string {
    const ua = navigator.userAgent
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Android/i.test(ua)) return 'Android'
    if (/iPad|iPhone|iPod/i.test(ua)) return 'iOS'
    if (/Mac OS/i.test(ua)) return 'macOS'
    if (/Linux/i.test(ua)) return 'Linux'
    if (/CrOS/i.test(ua)) return 'ChromeOS'
    return 'Unknown'
}

function detectBrowser(): string {
    const ua = navigator.userAgent
    if (/Firefox\//i.test(ua)) return 'Firefox'
    if (/Edg\//i.test(ua)) return 'Edge'
    if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera'
    if (/SamsungBrowser\//i.test(ua)) return 'Samsung Internet'
    if (/Chrome\//i.test(ua)) return 'Chrome'
    if (/Safari\//i.test(ua)) return 'Safari'
    return 'Unknown'
}

function isPWA(): boolean {
    // iOS: navigator.standalone is the only reliable check
    if ('standalone' in navigator) {
        return (navigator as any).standalone === true
    }
    // Android / Desktop: standard media query
    return window.matchMedia('(display-mode: standalone)').matches
        || window.matchMedia('(display-mode: fullscreen)').matches
}

/**
 * Returns a persistent anonymous user ID stored in localStorage.
 * This is NOT personally identifiable — just a random string for cohort analysis.
 */
function getAnonymousUserId(): string {
    const KEY = 'timeline-anon-uid'
    let uid = localStorage.getItem(KEY)
    if (!uid) {
        uid = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
        localStorage.setItem(KEY, uid)
    }
    return uid
}

// ── App version (injected by Vite at build time) ──────────────────
declare const __APP_VERSION__: string
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

// ── Initialization ───────────────────────────────────────────────

let initialized = false
let userProps: Record<string, string> = {}

/**
 * Call once on app startup to set user properties and anonymous ID.
 * Awaits analytics readiness (async init for iOS PWA support).
 */
export async function initAnalytics() {
    if (initialized) return
    initialized = true

    const analytics = await waitForAnalytics()
    if (!analytics) return

    const uid = getAnonymousUserId()
    setUserId(analytics, uid)

    // Compute properties
    userProps = {
        os: detectOS(),
        browser: detectBrowser(),
        app_version: APP_VERSION,
        is_pwa: isPWA() ? 'yes' : 'no',
    }

    // Set each property individually
    for (const [key, value] of Object.entries(userProps)) {
        setUserProperties(analytics, { [key]: value })
    }

    // Small delay to let gtag's internal transport finish setting up
    // before firing the first event (fixes Safari timing issue)
    setTimeout(() => {
        logEvent(analytics, 'app_opened', { ...userProps })
        flushPendingEvents()
    }, 500)
}

// ── Core tracker ─────────────────────────────────────────────────

// Buffer events that fire before analytics is ready (e.g. onboarding events on Safari)
const pendingEvents: Array<{ name: string; params?: Record<string, any> }> = []
let analyticsReady = false

// Called internally after init to flush any buffered events
function flushPendingEvents() {
    analyticsReady = true
    const inst = getAnalyticsInstance()
    if (!inst) return
    for (const evt of pendingEvents) {
        try { logEvent(inst, evt.name, evt.params) } catch { }
    }
    pendingEvents.length = 0
}

export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
    const analytics = getAnalyticsInstance()
    if (analytics && analyticsReady) {
        try {
            logEvent(analytics, eventName, eventParams)
        } catch (error) {
            console.warn('Analytics: failed to log', eventName, error)
        }
    } else {
        // Queue for later
        pendingEvents.push({ name: eventName, params: eventParams })
    }
}

// ── Timeline Events ──────────────────────────────────────────────

export function trackEventCreated(categoryId?: string, isRecurring?: boolean) {
    trackEvent('timeline_event_created', {
        category_id: categoryId || 'other',
        is_recurring: isRecurring ? 'yes' : 'no'
    })
}

export function trackEventEdited(categoryId?: string) {
    trackEvent('timeline_event_edited', { category_id: categoryId || 'other' })
}

export function trackEventDeleted() {
    trackEvent('timeline_event_deleted')
}

export function trackEventOpened(categoryId?: string) {
    trackEvent('timeline_event_opened', { category_id: categoryId || 'other' })
}

export function trackEventReordered(direction: 'up' | 'down') {
    trackEvent('timeline_event_reordered', { direction })
}

export function trackEventExportedICS() {
    trackEvent('event_exported_ics')
}

// ── Categories ───────────────────────────────────────────────────

export function trackCategoryFiltered(categoryId: string | null) {
    trackEvent('category_filtered', { category_id: categoryId || 'all' })
}

export function trackCategoryCreated() {
    trackEvent('category_created')
}

export function trackCategoryEdited() {
    trackEvent('category_edited')
}

export function trackCategoryDeleted() {
    trackEvent('category_deleted')
}

// ── Settings & Preferences ───────────────────────────────────────

export function trackThemeChange(theme: 'dark' | 'light') {
    trackEvent('theme_change', { theme })
}

export function trackSortModeChange(mode: 'auto' | 'manual') {
    trackEvent('sort_mode_change', { mode })
}

// ── Data Management ──────────────────────────────────────────────

export function trackDataExported() {
    trackEvent('data_exported')
}

export function trackDataImported() {
    trackEvent('data_imported')
}

// ── PWA ──────────────────────────────────────────────────────────

export function trackPWAUpdateApplied() {
    trackEvent('pwa_update_applied')
}

export function trackPWAUpdateDismissed() {
    trackEvent('pwa_update_dismissed')
}

// ── Navigation ───────────────────────────────────────────────────

export function trackScrollToToday(direction: 'up' | 'down') {
    trackEvent('scroll_to_today', { direction })
}

// ── Onboarding ───────────────────────────────────────────────────

export function trackOnboardingCompleted() {
    trackEvent('onboarding_completed')
}

export function trackOnboardingSkipped(step: number) {
    trackEvent('onboarding_skipped', { skipped_at_step: step })
}
