import type { RecurrenceRule } from '../types/TimelineEvent'

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Returns the number of whole days until the given future date.
 * Returns 0 if the date is today or in the past.
 */
export function calculateDaysUntil(date: Date): number {
    const today = startOfDay(new Date())
    const target = startOfDay(date)
    const diff = target.getTime() - today.getTime()
    return Math.max(0, Math.round(diff / MS_PER_DAY))
}

/**
 * Returns the number of whole days since the given past date.
 * Returns 0 if the date is today or in the future.
 */
export function calculateDaysSince(date: Date): number {
    const today = startOfDay(new Date())
    const target = startOfDay(date)
    const diff = today.getTime() - target.getTime()
    return Math.max(0, Math.round(diff / MS_PER_DAY))
}

/**
 * Given an anchor date and a recurrence rule, returns the next upcoming
 * occurrence on or after today.
 */
export function getNextOccurrence(anchor: Date, rule: RecurrenceRule): Date {
    const today = startOfDay(new Date())
    const next = new Date(anchor)

    if (rule.type === 'yearly') {
        next.setFullYear(today.getFullYear())
        if (next < today) {
            next.setFullYear(today.getFullYear() + 1)
        }
    } else if (rule.type === 'monthly') {
        next.setFullYear(today.getFullYear())
        next.setMonth(today.getMonth())
        if (next < today) {
            next.setMonth(today.getMonth() + 1)
        }
    }

    return next
}

/**
 * Returns a human-readable label for a day count.
 * e.g. "Today", "Tomorrow", "3 days"
 */
export function formatDayCount(days: number, direction: 'past' | 'future'): string {
    if (days === 0) return 'Today'
    if (days === 1) return direction === 'future' ? 'Tomorrow' : 'Yesterday'
    return direction === 'future' ? `${days} days` : `${days} days`
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * Formats a date using a custom format string.
 * Supported tokens: YYYY, YY, MMMM, MMM, MM, DD
 * e.g. "DD MMM YYYY" → "23 Feb 2026"
 */
export function formatDateCustom(date: Date, format: string): string {
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return format
        .replace('YYYY', String(year))
        .replace('YY', String(year).slice(-2))
        .replace('MMMM', MONTH_LONG[month])
        .replace('MMM', MONTH_SHORT[month])
        .replace('MM', String(month + 1).padStart(2, '0'))
        .replace('DD', String(day).padStart(2, '0'))
}

/** Normalises a Date to midnight local time for clean day comparisons. */
function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
