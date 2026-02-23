import { useState, useMemo, useRef } from 'react'
import type { TimelineEvent } from './types/TimelineEvent'
import { useEvents } from './hooks/useEvents'
import { TimelineView } from './components/TimelineView'
import { EventForm } from './components/EventForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { CategoryFilter } from './components/CategoryFilter'
import { CategoryManager } from './components/CategoryManager'
import { EventDetailModal } from './components/EventDetailModal'
import { useTheme } from './hooks/useTheme'
import { downloadICS } from './utils/calendarSync'
import { exportBackup, importBackup } from './utils/dataBackup'

export function App() {
    const { theme, toggleTheme } = useTheme()

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
    const [detailEvent, setDetailEvent] = useState<TimelineEvent | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const result = await importBackup(file)
            alert(`Imported ${result.events} events and ${result.categories} categories. Refresh to see changes.`)
            window.location.reload()
        } catch (err) {
            alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
        }
        e.target.value = '' // reset for re-import
    }

    return (
        <div className="app">
            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
            />

            <header className="app-header">
                <div className="app-header__inner">
                    <div className="app-header__brand">
                        <span className="app-header__logo" aria-hidden>⏳</span>
                        <h1 className="app-header__title">Timeline</h1>
                    </div>
                    <div className="app-header__controls">
                        <button
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={toggleTheme}
                            aria-label={`Toggle theme (current: ${theme})`}
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={exportBackup}
                            aria-label="Export backup"
                            title="Export Data"
                        >
                            📤
                        </button>
                        <button
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Import backup"
                            title="Import Data"
                        >
                            📥
                        </button>
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
                    onEventClick={setDetailEvent}
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

            <EventDetailModal
                event={detailEvent}
                category={categories.find(c => c.id === detailEvent?.categoryId)}
                isOpen={!!detailEvent}
                onClose={() => setDetailEvent(null)}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onExport={(evt) => downloadICS(evt)}
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
