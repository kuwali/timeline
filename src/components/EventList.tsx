import type { TimelineEvent } from '../types/TimelineEvent'
import type { SortMode } from '../hooks/useEvents'
import { EventCard } from './EventCard'
import { SwipeableCard } from './SwipeableCard'

interface EventListProps {
    events: TimelineEvent[]
    loading: boolean
    sortMode: SortMode
    onEdit: (event: TimelineEvent) => void
    onDelete: (id: string) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
}

export function EventList({ events, loading, sortMode, onEdit, onDelete, onMoveUp, onMoveDown }: EventListProps) {
    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" aria-label="Loading events" />
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

    return (
        <ol className="event-list" aria-label="Timeline events">
            {events.map((event, index) => (
                <li key={event.id} className="event-list__item">
                    <SwipeableCard
                        onSwipeRight={() => onEdit(event)}
                        onSwipeLeft={() => onDelete(event.id)}
                    >
                        <EventCard
                            event={event}
                            isFirst={index === 0}
                            isLast={index === events.length - 1}
                            sortMode={sortMode}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                        />
                    </SwipeableCard>
                </li>
            ))}
        </ol>
    )
}
