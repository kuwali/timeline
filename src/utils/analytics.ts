import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

/**
 * Safely logs an event to Firebase Analytics if it's initialized.
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (analytics) {
        try {
            logEvent(analytics, eventName, eventParams)
        } catch (error) {
            console.warn('Failed to log event', error)
        }
    }
}

// Pre-defined tracking functions for consistent event naming

export function trackThemeChange(theme: 'dark' | 'light') {
    trackEvent('theme_change', { theme })
}

export function trackSortModeChange(mode: 'auto' | 'manual') {
    trackEvent('sort_mode_change', { mode })
}

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

export function trackDataExported() {
    trackEvent('data_exported')
}

export function trackDataImported() {
    trackEvent('data_imported')
}
