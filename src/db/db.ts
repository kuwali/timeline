import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { TimelineEvent } from '../types/TimelineEvent'

const DB_NAME = 'timeline-db'
const DB_VERSION = 1
const STORE_NAME = 'events'

interface TimelineDB extends DBSchema {
    events: {
        key: string
        value: TimelineEvent
        indexes: { by_sort_order: number }
    }
}

let dbPromise: Promise<IDBPDatabase<TimelineDB>> | null = null

function getDB(): Promise<IDBPDatabase<TimelineDB>> {
    if (!dbPromise) {
        dbPromise = openDB<TimelineDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('by_sort_order', 'sortOrder')
            },
        })
    }
    return dbPromise
}

export async function getAllEvents(): Promise<TimelineEvent[]> {
    const db = await getDB()
    return db.getAllFromIndex(STORE_NAME, 'by_sort_order')
}

export async function addEvent(event: TimelineEvent): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAME, event)
}

export async function updateEvent(event: TimelineEvent): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAME, event)
}

export async function deleteEvent(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
}
