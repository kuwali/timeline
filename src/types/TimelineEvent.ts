export type RecurrenceRule = {
    type: 'yearly' | 'monthly'
}

export type TimelineEvent = {
    id: string
    title: string
    anchorDate: string // ISO date string — NEVER store computed values
    direction: 'past' | 'future'
    recurrenceRule?: RecurrenceRule
    category?: string
    icon?: string
    sortOrder: number
    displayFormat?: string // e.g. "DD MMM", "YYYY-MM-DD" — custom counter label
    notificationConfig?: null // placeholder for Phase 4
}
