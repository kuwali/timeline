import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { TimelineEvent } from './types/TimelineEvent'
import { useEvents } from './hooks/useEvents'
import { TimelineView } from './components/TimelineView'
import { EventForm } from './components/EventForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { CategoryFilter } from './components/CategoryFilter'
import { CategoryManager } from './components/CategoryManager'
import { EventDetailModal } from './components/EventDetailModal'
import { SettingsMenu } from './components/SettingsMenu'
import { useTheme } from './hooks/useTheme'
import { useServiceWorker } from './hooks/useServiceWorker'
import { downloadICS } from './utils/calendarSync'
import { exportBackup, importBackup } from './utils/dataBackup'
import { trackThemeChange, trackSortModeChange, trackDataImported, trackDataExported } from './utils/analytics'

export function App() {
    const { theme, toggleTheme } = useTheme()
    const { showUpdate, updateAvailable, checking, applyUpdate, dismissUpdate, checkForUpdate } = useServiceWorker()

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
        const newMode = sortMode === 'auto' ? 'manual' : 'auto'
        setSortMode(newMode)
        trackSortModeChange(newMode)
    }

    async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const result = await importBackup(file)
            trackDataImported()
            alert(`Imported ${result.events} events and ${result.categories} categories. Refresh to see changes.`)
            window.location.reload()
        } catch (err) {
            alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
        }
        e.target.value = '' // reset for re-import
    }

    function handleCheckForUpdates() {
        if (updateAvailable) {
            applyUpdate()
        } else {
            checkForUpdate()
        }
    }

    // Scroll-to-today FAB: track TODAY marker position
    const [todayDirection, setTodayDirection] = useState<'up' | 'down' | null>(null)

    const handleScroll = useCallback(() => {
        const todayEl = document.querySelector('[data-today-marker]')
        if (todayEl) {
            const rect = todayEl.getBoundingClientRect()
            const viewH = window.innerHeight
            if (rect.top < -100) {
                setTodayDirection('up')
            } else if (rect.top > viewH + 100) {
                setTodayDirection('down')
            } else {
                setTodayDirection(null)
            }
        }
    }, [])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    function scrollToToday() {
        const todayEl = document.querySelector('[data-today-marker]')
        todayEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
                        <SettingsMenu
                            theme={theme}
                            sortMode={sortMode}
                            updateAvailable={updateAvailable}
                            checking={checking}
                            categories={categories}
                            onToggleTheme={() => {
                                const newTheme = theme === 'dark' ? 'light' : 'dark'
                                toggleTheme()
                                trackThemeChange(newTheme)
                            }}
                            onToggleSortMode={toggleSortMode}
                            onExport={() => {
                                exportBackup()
                                trackDataExported()
                            }}
                            onImport={() => fileInputRef.current?.click()}
                            onManageCategories={() => setCatManagerOpen(true)}
                            onCheckForUpdates={handleCheckForUpdates}
                        />
                        <span className="app-header__logo" aria-hidden>⏳</span>
                        <h1 className="app-header__title">Timeline</h1>
                    </div>
                    <div className="app-header__controls">
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

            {/* PWA Update Toast */}
            {showUpdate && (
                <div className="update-toast">
                    <span className="update-toast__text">🚀 A new version is available!</span>
                    <div className="update-toast__actions">
                        <button className="btn btn--primary btn--sm" onClick={applyUpdate}>Update now</button>
                        <button className="btn btn--ghost btn--sm" onClick={dismissUpdate}>Later</button>
                    </div>
                </div>
            )}

            {/* Scroll to TODAY FAB */}
            {todayDirection && (
                <button
                    className={`scroll-today-fab scroll-today-fab--${todayDirection}`}
                    onClick={scrollToToday}
                    aria-label="Scroll to today"
                >
                    <span className="scroll-today-fab__arrow">
                        {todayDirection === 'up' ? '↑' : '↓'}
                    </span>
                    <span className="scroll-today-fab__label">TODAY</span>
                </button>
            )}
        </div>
    )
}
