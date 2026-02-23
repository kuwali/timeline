import type { TimelineEvent } from '../types/TimelineEvent'
import { calculateDaysUntil, calculateDaysSince, getNextOccurrence, formatDateCustom } from '../utils/timeCalc'
import type { SortMode } from '../hooks/useEvents'

interface EventCardProps {
    event: TimelineEvent
    isFirst: boolean
    isLast: boolean
    sortMode: SortMode
    onEdit: (event: TimelineEvent) => void
    onDelete: (id: string) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
    life: 'var(--color-life)',
    work: 'var(--color-work)',
    travel: 'var(--color-travel)',
    health: 'var(--color-health)',
    milestone: 'var(--color-milestone)',
    birthday: 'var(--color-birthday)',
    other: 'var(--color-other)',
}

export function EventCard({
    event,
    isFirst,
    isLast,
    sortMode,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
}: EventCardProps) {
    // Derive the effective date — for recurring events, use next occurrence
    let effectiveDate = new Date(event.anchorDate)
    if (event.recurrenceRule) {
        effectiveDate = getNextOccurrence(effectiveDate, event.recurrenceRule)
    }

    const dayCount =
        event.direction === 'future'
            ? calculateDaysUntil(effectiveDate)
            : calculateDaysSince(effectiveDate)

    const isToday = dayCount === 0
    const isTomorrow = event.direction === 'future' && dayCount === 1
    const isYesterday = event.direction === 'past' && dayCount === 1

    function getLabel(): string {
        if (isToday) return 'Today'
        if (isTomorrow) return 'Tomorrow'
        if (isYesterday) return 'Yesterday'
        if (event.direction === 'future') return 'days until'
        return 'days since'
    }

    const categoryColor =
        CATEGORY_COLORS[event.category ?? 'other'] ?? CATEGORY_COLORS['other']

    // Use custom display format if provided, else default
    const formattedDate = event.displayFormat
        ? formatDateCustom(effectiveDate, event.displayFormat)
        : effectiveDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

    return (
        <article className={`event-card ${isToday ? 'event-card--today' : ''}`}>
            <div className="event-card__accent" style={{ background: categoryColor }} />

            <div className="event-card__body">
                <div className="event-card__header">
                    <div className="event-card__title-row">
                        {event.icon && <span className="event-card__icon" aria-hidden>{event.icon}</span>}
                        <h3 className="event-card__title">{event.title}</h3>
                    </div>
                    <div className="event-card__actions">
                        {sortMode === 'manual' && (
                            <>
                                <button
                                    className="icon-btn"
                                    onClick={() => onMoveUp(event.id)}
                                    disabled={isFirst}
                                    aria-label="Move up"
                                    title="Move up"
                                >
                                    ↑
                                </button>
                                <button
                                    className="icon-btn"
                                    onClick={() => onMoveDown(event.id)}
                                    disabled={isLast}
                                    aria-label="Move down"
                                    title="Move down"
                                >
                                    ↓
                                </button>
                            </>
                        )}
                        <button
                            className="icon-btn"
                            onClick={() => onEdit(event)}
                            aria-label="Edit event"
                            title="Edit"
                        >
                            ✏️
                        </button>
                        <button
                            className="icon-btn icon-btn--danger"
                            onClick={() => onDelete(event.id)}
                            aria-label="Delete event"
                            title="Delete"
                        >
                            🗑
                        </button>
                    </div>
                </div>

                <div className="event-card__meta">
                    {event.category && (
                        <span className="event-card__category" style={{ borderColor: categoryColor, color: categoryColor }}>
                            {event.category}
                        </span>
                    )}
                    {event.recurrenceRule && (
                        <span className="event-card__recurrence">🔁 {event.recurrenceRule.type}</span>
                    )}
                    <span className="event-card__date">{formattedDate}</span>
                </div>

                <div className="event-card__counter">
                    {isToday || isTomorrow || isYesterday ? (
                        <span className="event-card__day-label-only">{getLabel()}</span>
                    ) : (
                        <>
                            <span className="event-card__day-number">{dayCount}</span>
                            <span className="event-card__day-label">{getLabel()}</span>
                        </>
                    )}
                </div>
            </div>
        </article>
    )
}
