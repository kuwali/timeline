import type { RecurrenceRule } from '../types/TimelineEvent'

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Returns whether the given date is in the past (before today).
 */
export function isInPast(date: Date): boolean {
    return startOfDay(date) < startOfDay(new Date())
}

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
 * Calculates the duration between two dates as years, months, and days.
 * Always returns positive values (uses absolute difference).
 */
export function calculateDuration(from: Date, to: Date): { years: number; months: number; days: number } {
    // Ensure from <= to
    let start = startOfDay(from)
    let end = startOfDay(to)
    if (start > end) {
        const temp = start
        start = end
        end = temp
    }

    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    let days = end.getDate() - start.getDate()

    if (days < 0) {
        months -= 1
        // days in previous month
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
        days += prevMonth.getDate()
    }

    if (months < 0) {
        years -= 1
        months += 12
    }

    return { years, months, days }
}

/**
 * Formats a duration between two dates using a format string.
 * Tokens: YY → years, MM → months, DD → days
 * Example: "YY year MM month DD day" → "1 year 3 month 15 day"
 */
export function formatDuration(from: Date, to: Date, format: string): string {
    const dur = calculateDuration(from, to)
    return format
        .replace('YY', String(dur.years))
        .replace('MM', String(dur.months))
        .replace('DD', String(dur.days))
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

/** Normalises a Date to midnight local time for clean day comparisons. */
function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
