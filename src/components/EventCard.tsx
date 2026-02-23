import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'
import type { SortMode } from '../hooks/useEvents'
import { calculateDaysUntil, calculateDaysSince, getNextOccurrence, isInPast, formatDuration } from '../utils/timeCalc'

interface EventCardProps {
    event: TimelineEvent
    category: Category | undefined
    isFirst: boolean
    isLast: boolean
    sortMode: SortMode
    onClick: (event: TimelineEvent) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
}

export function EventCard({
    event,
    category,
    isFirst,
    isLast,
    sortMode,
    onClick,
    onMoveUp,
    onMoveDown,
}: EventCardProps) {
    const now = new Date()
    const startDate = new Date(event.anchorDate)
    const endDate = event.endDate ? new Date(event.endDate) : null

    // For recurring events, use next occurrence of the start
    let effectiveStart = startDate
    if (event.recurrenceRule) {
        effectiveStart = getNextOccurrence(startDate, event.recurrenceRule)
    }

    // Smart date selection for range events:
    // - Future (start is ahead)  → count down to start date
    // - Ongoing (start past, end future) → show "Happening now"
    // - Past (end is past, or no end and start is past) → count up from end date (or start if no end)
    const startIsPast = isInPast(effectiveStart)
    const endIsPast = endDate ? isInPast(endDate) : startIsPast
    const isOngoing = endDate && startIsPast && !endIsPast

    // Choose the effective date for the countdown
    let effectiveDate: Date
    if (isOngoing) {
        effectiveDate = now // "today" — ongoing
    } else if (!startIsPast) {
        effectiveDate = effectiveStart // future → count to start
    } else if (endDate && endIsPast) {
        effectiveDate = endDate // past range → count from end
    } else {
        effectiveDate = effectiveStart // single past event
    }

    const isPast = isInPast(effectiveDate)
    const dayCount = isPast
        ? calculateDaysSince(effectiveDate)
        : calculateDaysUntil(effectiveDate)

    const isToday = dayCount === 0 || isOngoing
    const isTomorrow = !isPast && !isOngoing && dayCount === 1
    const isYesterday = isPast && !isOngoing && dayCount === 1

    const catColor = category?.color ?? '#6b7fa3'
    const catIcon = category?.icon ?? '📌'
    const catName = category?.name ?? 'Other'

    // Build counter display
    function renderCounter() {
        if (isOngoing) return <span className="event-card__day-label-only" style={{ color: 'var(--color-accent)' }}>Happening now</span>
        if (isToday) return <span className="event-card__day-label-only">Today</span>
        if (isTomorrow) return <span className="event-card__day-label-only">Tomorrow</span>
        if (isYesterday) return <span className="event-card__day-label-only">Yesterday</span>

        // If user set a display format, show duration breakdown
        if (event.displayFormat) {
            const today = new Date()
            const label = formatDuration(today, effectiveDate, event.displayFormat)
            return (
                <>
                    <span className="event-card__day-duration">{label}</span>
                    <span className="event-card__day-label">{isPast ? 'ago' : 'remaining'}</span>
                </>
            )
        }

        // Default: total days
        return (
            <>
                <span className="event-card__day-number">{dayCount}</span>
                <span className="event-card__day-label">{isPast ? 'days ago' : 'days until'}</span>
            </>
        )
    }

    // Formatted date for meta row — show start or end depending on context
    const displayDate = isOngoing ? effectiveStart : effectiveDate
    const formattedDate = displayDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <article
            className={`event-card ${isToday ? 'event-card--today' : ''} ${isPast ? 'event-card--past' : ''}`}
            onClick={() => onClick(event)}
        >
            {/* Timeline node */}
            <div className="event-card__node">
                <div className="event-card__dot" style={{ background: catColor, boxShadow: `0 0 8px ${catColor}40` }} />
            </div>

            <div className="event-card__accent" style={{ background: catColor }} />

            <div className="event-card__body">
                <div className="event-card__header">
                    <div className="event-card__title-row">
                        <span className="event-card__icon" aria-hidden>{catIcon}</span>
                        <h3 className="event-card__title">{event.title}</h3>
                    </div>
                    <div className="event-card__actions">
                        {sortMode === 'manual' && (
                            <>
                                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onMoveUp(event.id) }} disabled={isFirst} aria-label="Move up" title="Move up">↑</button>
                                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onMoveDown(event.id) }} disabled={isLast} aria-label="Move down" title="Move down">↓</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="event-card__meta">
                    <span className="event-card__category" style={{ borderColor: catColor, color: catColor }}>
                        {catName}
                    </span>
                    {event.recurrenceRule && (
                        <span className="event-card__recurrence">🔁 {event.recurrenceRule.type}</span>
                    )}
                    <span className="event-card__date">{formattedDate}</span>
                </div>

                <div className="event-card__counter">
                    {renderCounter()}
                </div>
            </div>
        </article>
    )
}
