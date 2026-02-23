export type RecurrenceRule = {
    type: 'yearly' | 'monthly'
}

export type TimelineEvent = {
    id: string
    title: string
    anchorDate: string // ISO date string. If isAllDay=false, this includes specific time.
    endDate?: string   // ISO date string for ranges. Optional.
    isAllDay?: boolean // True by default for backwards compatibility
    recurrenceRule?: RecurrenceRule
    categoryId?: string // references Category.id
    sortOrder: number
    displayFormat?: string // duration format: "YY year MM month DD day" or empty for total days
    notificationConfig?: null // placeholder for Phase 4
}
