import { useState } from 'react'
import type { TimelineEvent } from './types/TimelineEvent'
import { useEvents } from './hooks/useEvents'
import { EventList } from './components/EventList'
import { EventForm } from './components/EventForm'
import { ConfirmDialog } from './components/ConfirmDialog'

export function App() {
    const { events, loading, sortMode, setSortMode, createEvent, editEvent, removeEvent, reorderEvent } = useEvents()
    const [formOpen, setFormOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    function handleEdit(event: TimelineEvent) {
        setEditingEvent(event)
        setFormOpen(true)
    }

    function handleAdd() {
        setEditingEvent(null)
        setFormOpen(true)
    }

    function handleClose() {
        setFormOpen(false)
        setEditingEvent(null)
    }

    function handleDeleteRequest(id: string) {
        setPendingDeleteId(id)
        setConfirmOpen(true)
    }

    async function handleDeleteConfirm() {
        if (pendingDeleteId) {
            await removeEvent(pendingDeleteId)
        }
        setConfirmOpen(false)
        setPendingDeleteId(null)
    }

    function handleDeleteCancel() {
        setConfirmOpen(false)
        setPendingDeleteId(null)
    }

    function toggleSortMode() {
        setSortMode(sortMode === 'auto' ? 'manual' : 'auto')
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-header__inner">
                    <div className="app-header__brand">
                        <span className="app-header__logo" aria-hidden>⏳</span>
                        <h1 className="app-header__title">Timeline</h1>
                    </div>
                    <div className="app-header__controls">
                        <button
                            id="sort-mode-btn"
                            className="btn btn--ghost btn--sm"
                            onClick={toggleSortMode}
                            aria-label={`Sort: ${sortMode === 'auto' ? 'Chronological' : 'Manual'}`}
                            title={`Sort: ${sortMode === 'auto' ? 'Chronological' : 'Manual'}`}
                        >
                            {sortMode === 'auto' ? '📊 Auto' : '✋ Manual'}
                        </button>
                        <button
                            id="add-event-btn"
                            className="btn btn--primary"
                            onClick={handleAdd}
                            aria-label="Add new event"
                        >
                            + Add
                        </button>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <EventList
                    events={events}
                    loading={loading}
                    sortMode={sortMode}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onMoveUp={id => reorderEvent(id, 'up')}
                    onMoveDown={id => reorderEvent(id, 'down')}
                />
            </main>

            <EventForm
                isOpen={formOpen}
                initialEvent={editingEvent}
                onSave={createEvent}
                onUpdate={editEvent}
                onClose={handleClose}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                title="Delete Event"
                message="Are you sure you want to remove this event from your timeline? This cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Keep"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    )
}
