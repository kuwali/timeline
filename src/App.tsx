import { useState, useMemo } from 'react'
import type { TimelineEvent } from './types/TimelineEvent'
import { useEvents } from './hooks/useEvents'
import { TimelineView } from './components/TimelineView'
import { EventForm } from './components/EventForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { CategoryFilter } from './components/CategoryFilter'
import { CategoryManager } from './components/CategoryManager'

export function App() {
    const {
        events, categories, loading,
        sortMode, setSortMode,
        createEvent, editEvent, removeEvent, reorderEvent,
        addCategory, editCategory, removeCategory,
    } = useEvents()

    const [formOpen, setFormOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [catManagerOpen, setCatManagerOpen] = useState(false)
    const [filterCategory, setFilterCategory] = useState<string | null>(null)

    // Compute which categories are in use
    const usedCategoryIds = useMemo(() => {
        const ids = new Set<string>()
        for (const e of events) {
            if (e.categoryId) ids.add(e.categoryId)
        }
        return ids
    }, [events])

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
        if (pendingDeleteId) await removeEvent(pendingDeleteId)
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
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={() => setCatManagerOpen(true)}
                            aria-label="Manage categories"
                            title="Categories"
                        >
                            ⚙️
                        </button>
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={toggleSortMode}
                            aria-label={`Sort: ${sortMode === 'auto' ? 'Chronological' : 'Manual'}`}
                            title={`Sort: ${sortMode === 'auto' ? 'Chronological' : 'Manual'}`}
                        >
                            {sortMode === 'auto' ? '📊 Auto' : '✋ Manual'}
                        </button>
                        <button
                            className="btn btn--primary"
                            onClick={handleAdd}
                            aria-label="Add new event"
                        >
                            + Add
                        </button>
                    </div>
                </div>

                <CategoryFilter
                    categories={categories}
                    usedCategoryIds={usedCategoryIds}
                    activeFilter={filterCategory}
                    onFilter={setFilterCategory}
                />
            </header>

            <main className="app-main">
                <TimelineView
                    events={events}
                    categories={categories}
                    loading={loading}
                    sortMode={sortMode}
                    filterCategory={filterCategory}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onMoveUp={id => reorderEvent(id, 'up')}
                    onMoveDown={id => reorderEvent(id, 'down')}
                />
            </main>

            <EventForm
                isOpen={formOpen}
                categories={categories}
                initialEvent={editingEvent}
                onSave={createEvent}
                onUpdate={editEvent}
                onClose={handleClose}
                onManageCategories={() => { handleClose(); setCatManagerOpen(true) }}
            />

            <CategoryManager
                isOpen={catManagerOpen}
                categories={categories}
                onAdd={addCategory}
                onEdit={editCategory}
                onDelete={removeCategory}
                onClose={() => setCatManagerOpen(false)}
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
