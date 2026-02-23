import { useState, useEffect, useCallback } from 'react'
import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'
import {
    getAllEvents, addEvent, updateEvent, deleteEvent,
    getAllCategories, addCategory as addCategoryDB,
    updateCategory as updateCategoryDB,
    deleteCategory as deleteCategoryDB,
} from '../db/db'

export type SortMode = 'auto' | 'manual'

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getSavedSortMode(): SortMode {
    const saved = localStorage.getItem('timeline-sort-mode')
    return saved === 'auto' || saved === 'manual' ? saved : 'manual'
}

export function useEvents() {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [sortMode, setSortModeState] = useState<SortMode>(getSavedSortMode)

    const setSortMode = useCallback((mode: SortMode) => {
        setSortModeState(mode)
        localStorage.setItem('timeline-sort-mode', mode)
    }, [])

    const sortEvents = useCallback(
        (list: TimelineEvent[]): TimelineEvent[] => {
            if (sortMode === 'auto') {
                return [...list].sort((a, b) => {
                    const dateA = new Date(a.anchorDate).getTime()
                    const dateB = new Date(b.anchorDate).getTime()
                    return dateA - dateB
                })
            }
            return [...list].sort((a, b) => a.sortOrder - b.sortOrder)
        },
        [sortMode]
    )

    // Load events + categories on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [evts, cats] = await Promise.all([getAllEvents(), getAllCategories()])
                setEvents(sortEvents(evts))
                setCategories(cats)
            } catch (err) {
                console.error('[Timeline] Failed to load data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Re-sort when sort mode changes
    useEffect(() => {
        setEvents(prev => sortEvents(prev))
    }, [sortMode, sortEvents])

    // ── Event CRUD ─────────────────────────────────────────────────

    const createEvent = useCallback(
        async (draft: Omit<TimelineEvent, 'id' | 'sortOrder'>) => {
            const maxOrder = events.reduce((max, e) => Math.max(max, e.sortOrder), -1)
            const newEvent: TimelineEvent = {
                ...draft,
                id: generateId(),
                sortOrder: maxOrder + 1,
            }
            await addEvent(newEvent)
            setEvents(prev => sortEvents([...prev, newEvent]))
        },
        [events, sortEvents]
    )

    const editEvent = useCallback(
        async (updated: TimelineEvent) => {
            await updateEvent(updated)
            setEvents(prev => sortEvents(prev.map(e => (e.id === updated.id ? updated : e))))
        },
        [sortEvents]
    )

    const removeEvent = useCallback(async (id: string) => {
        await deleteEvent(id)
        setEvents(prev => prev.filter(e => e.id !== id))
    }, [])

    const reorderEvent = useCallback(
        async (id: string, direction: 'up' | 'down') => {
            const sorted = [...events]
            const index = sorted.findIndex(e => e.id === id)
            if (index === -1) return
            const swapIndex = direction === 'up' ? index - 1 : index + 1
            if (swapIndex < 0 || swapIndex >= sorted.length) return

            const tempOrder = sorted[index].sortOrder
            sorted[index] = { ...sorted[index], sortOrder: sorted[swapIndex].sortOrder }
            sorted[swapIndex] = { ...sorted[swapIndex], sortOrder: tempOrder }

            await updateEvent(sorted[index])
            await updateEvent(sorted[swapIndex])
            setEvents([...sorted].sort((a, b) => a.sortOrder - b.sortOrder))
        },
        [events]
    )

    // ── Category CRUD ──────────────────────────────────────────────

    const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
        const newCat: Category = { ...cat, id: generateId() }
        await addCategoryDB(newCat)
        setCategories(prev => [...prev, newCat])
        return newCat
    }, [])

    const editCategory = useCallback(async (cat: Category) => {
        await updateCategoryDB(cat)
        setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)))
    }, [])

    const removeCategory = useCallback(async (id: string) => {
        await deleteCategoryDB(id)
        setCategories(prev => prev.filter(c => c.id !== id))
        // Reassign events with this category to 'other'
        const affected = events.filter(e => e.categoryId === id)
        for (const evt of affected) {
            const updated = { ...evt, categoryId: 'other' }
            await updateEvent(updated)
            setEvents(prev => prev.map(e => (e.id === evt.id ? updated : e)))
        }
    }, [events])

    return {
        events, categories, loading,
        sortMode, setSortMode,
        createEvent, editEvent, removeEvent, reorderEvent,
        addCategory, editCategory, removeCategory,
    }
}
