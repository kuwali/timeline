import { useMemo } from 'react'
import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'
import type { SortMode } from '../hooks/useEvents'
import { EventCard } from './EventCard'
import { SwipeableCard } from './SwipeableCard'
import { TimelineDivider } from './TimelineDivider'
import { isInPast, getNextOccurrence } from '../utils/timeCalc'

interface TimelineViewProps {
    events: TimelineEvent[]
    categories: Category[]
    loading: boolean
    sortMode: SortMode
    filterCategory: string | null
    onEdit: (event: TimelineEvent) => void
    onDelete: (id: string) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
}

function getCategoryMap(categories: Category[]): Map<string, Category> {
    const map = new Map<string, Category>()
    for (const c of categories) map.set(c.id, c)
    return map
}

function getEffectiveDate(event: TimelineEvent): Date {
    let date = new Date(event.anchorDate)
    if (event.recurrenceRule) {
        date = getNextOccurrence(date, event.recurrenceRule)
    }
    return date
}

export function TimelineView({ events, categories, loading, sortMode, filterCategory, onEdit, onDelete, onMoveUp, onMoveDown }: TimelineViewProps) {
    const catMap = useMemo(() => getCategoryMap(categories), [categories])

    const filteredEvents = useMemo(() => {
        if (!filterCategory) return events
        return events.filter(e => e.categoryId === filterCategory)
    }, [events, filterCategory])

    // Build timeline items: events + dividers
    const timelineItems = useMemo(() => {
        if (sortMode !== 'auto') return filteredEvents.map(e => ({ type: 'event' as const, event: e }))

        type Item = { type: 'event'; event: TimelineEvent } | { type: 'divider'; label: string; variant: 'year' | 'today' }
        const items: Item[] = []
        let lastYear: number | null = null
        let todayInserted = false

        for (const event of filteredEvents) {
            const effectiveDate = getEffectiveDate(event)
            const eventYear = effectiveDate.getFullYear()
            const eventIsPast = isInPast(effectiveDate)

            // Insert "Today" marker at boundary between past and future
            if (!todayInserted && !eventIsPast) {
                items.push({ type: 'divider', label: '✦ Today ✦', variant: 'today' })
                todayInserted = true
                lastYear = null // reset year after today marker
            }

            // Year divider
            if (lastYear !== eventYear) {
                items.push({ type: 'divider', label: String(eventYear), variant: 'year' })
                lastYear = eventYear
            }

            items.push({ type: 'event', event })
        }

        // If all events are in the past, add today at the end
        if (!todayInserted && filteredEvents.length > 0) {
            items.push({ type: 'divider', label: '✦ Today ✦', variant: 'today' })
        }

        return items
    }, [filteredEvents, sortMode])

    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" aria-label="Loading" />
                <p className="state-text">Loading your timeline…</p>
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <div className="state-container">
                <div className="empty-icon" aria-hidden>🌅</div>
                <h2 className="empty-title">Your timeline is empty</h2>
                <p className="state-text">Add your first time anchor to start tracking what matters.</p>
            </div>
        )
    }

    if (filteredEvents.length === 0) {
        return (
            <div className="state-container">
                <div className="empty-icon" aria-hidden>🔍</div>
                <h2 className="empty-title">No events in this category</h2>
                <p className="state-text">Try selecting a different category filter.</p>
            </div>
        )
    }

    return (
        <div className="timeline" aria-label="Timeline">
            <div className="timeline__line" />
            <ol className="timeline__list">
                {timelineItems.map((item, i) => {
                    if (item.type === 'divider') {
                        return (
                            <li key={`div-${i}`} className="timeline__divider-item">
                                <TimelineDivider label={item.label} variant={item.variant} />
                            </li>
                        )
                    }

                    const event = item.event
                    return (
                        <li key={event.id} className="timeline__event-item">
                            <SwipeableCard
                                onSwipeRight={() => onEdit(event)}
                                onSwipeLeft={() => onDelete(event.id)}
                            >
                                <EventCard
                                    event={event}
                                    category={catMap.get(event.categoryId ?? 'other')}
                                    isFirst={i === 0}
                                    isLast={i === timelineItems.length - 1}
                                    sortMode={sortMode}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onMoveUp={onMoveUp}
                                    onMoveDown={onMoveDown}
                                />
                            </SwipeableCard>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
