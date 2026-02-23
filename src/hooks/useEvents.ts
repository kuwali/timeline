import { useState, useEffect, useCallback } from 'react'
import type { TimelineEvent } from '../types/TimelineEvent'
import { getAllEvents, addEvent, updateEvent, deleteEvent } from '../db/db'

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
    const [loading, setLoading] = useState(true)
    const [sortMode, setSortModeState] = useState<SortMode>(getSavedSortMode)

    const setSortMode = useCallback((mode: SortMode) => {
        setSortModeState(mode)
        localStorage.setItem('timeline-sort-mode', mode)
    }, [])

    // Sort helper
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

    // Load all events from IndexedDB on mount
    useEffect(() => {
        getAllEvents()
            .then(list => setEvents(sortEvents(list)))
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Re-sort when sort mode changes
    useEffect(() => {
        setEvents(prev => sortEvents(prev))
    }, [sortMode, sortEvents])

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

    return { events, loading, sortMode, setSortMode, createEvent, editEvent, removeEvent, reorderEvent }
}
