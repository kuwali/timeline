import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'

const DB_NAME = 'timeline-db'
const DB_VERSION = 2
const EVENTS_STORE = 'events'
const CATEGORIES_STORE = 'categories'

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'life', name: 'Life', icon: '❤️', color: '#a78bfa' },
    { id: 'work', name: 'Work', icon: '💼', color: '#60a5fa' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#34d399' },
    { id: 'health', name: 'Health', icon: '💪', color: '#f87171' },
    { id: 'milestone', name: 'Milestone', icon: '🏆', color: '#fbbf24' },
    { id: 'birthday', name: 'Birthday', icon: '🎂', color: '#f472b6' },
    { id: 'other', name: 'Other', icon: '📌', color: '#6b7fa3' },
]

interface TimelineDB extends DBSchema {
    events: {
        key: string
        value: TimelineEvent
        indexes: { by_sort_order: number }
    }
    categories: {
        key: string
        value: Category
    }
}

let dbInstance: IDBPDatabase<TimelineDB> | null = null

async function getDB(): Promise<IDBPDatabase<TimelineDB>> {
    if (dbInstance) return dbInstance

    const db = await openDB<TimelineDB>(DB_NAME, DB_VERSION, {
        upgrade(upgradeDb, oldVersion) {
            if (oldVersion < 1) {
                const store = upgradeDb.createObjectStore(EVENTS_STORE, { keyPath: 'id' })
                store.createIndex('by_sort_order', 'sortOrder')
            }
            if (oldVersion < 2) {
                upgradeDb.createObjectStore(CATEGORIES_STORE, { keyPath: 'id' })
            }
        },
    })

    // Seed default categories if store is empty (runs after upgrade completes)
    const existingCats = await db.getAll(CATEGORIES_STORE)
    if (existingCats.length === 0) {
        const tx = db.transaction(CATEGORIES_STORE, 'readwrite')
        for (const cat of DEFAULT_CATEGORIES) {
            tx.store.put(cat)
        }
        await tx.done
    }

    // Migrate old v1 events if needed (clean up stale fields)
    const allEvents = await db.getAll(EVENTS_STORE)
    for (const evt of allEvents) {
        const raw = evt as Record<string, unknown>
        let needsUpdate = false

        if ('category' in raw && !('categoryId' in raw)) {
            raw.categoryId = raw.category
            delete raw.category
            needsUpdate = true
        }
        if ('direction' in raw) {
            delete raw.direction
            needsUpdate = true
        }
        if ('icon' in raw) {
            delete raw.icon
            needsUpdate = true
        }

        if (needsUpdate) {
            await db.put(EVENTS_STORE, raw as unknown as TimelineEvent)
        }
    }

    dbInstance = db
    return db
}

// ── Events ────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<TimelineEvent[]> {
    const db = await getDB()
    return db.getAllFromIndex(EVENTS_STORE, 'by_sort_order')
}

export async function addEvent(event: TimelineEvent): Promise<void> {
    const db = await getDB()
    await db.put(EVENTS_STORE, event)
}

export async function updateEvent(event: TimelineEvent): Promise<void> {
    const db = await getDB()
    await db.put(EVENTS_STORE, event)
}

export async function deleteEvent(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(EVENTS_STORE, id)
}

// ── Categories ────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
    const db = await getDB()
    return db.getAll(CATEGORIES_STORE)
}

export async function addCategory(cat: Category): Promise<void> {
    const db = await getDB()
    await db.put(CATEGORIES_STORE, cat)
}

export async function updateCategory(cat: Category): Promise<void> {
    const db = await getDB()
    await db.put(CATEGORIES_STORE, cat)
}

export async function deleteCategory(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(CATEGORIES_STORE, id)
}
