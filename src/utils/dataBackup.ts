import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'
import { getAllEvents, addEvent, getAllCategories, addCategory } from '../db/db'

export interface BackupData {
    version: number
    exportedAt: string
    events: TimelineEvent[]
    categories: Category[]
}

/**
 * Exports all events and categories to a JSON backup file and triggers download.
 */
export async function exportBackup(): Promise<void> {
    const events = await getAllEvents()
    const categories = await getAllCategories()

    const backup: BackupData = {
        version: 3,
        exportedAt: new Date().toISOString(),
        events,
        categories,
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const timestamp = new Date().toISOString().slice(0, 10)
    a.download = `timeline-backup-${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Imports events and categories from a backup JSON file.
 * Returns the number of items imported.
 */
export async function importBackup(file: File): Promise<{ events: number; categories: number }> {
    const text = await file.text()
    const data = JSON.parse(text) as BackupData

    if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid backup file: missing events array')
    }

    let catCount = 0
    let evtCount = 0

    // Import categories first
    if (data.categories && Array.isArray(data.categories)) {
        const existingCats = await getAllCategories()
        const existingIds = new Set(existingCats.map(c => c.id))
        for (const cat of data.categories) {
            if (!existingIds.has(cat.id)) {
                await addCategory(cat)
                catCount++
            }
        }
    }

    // Import events
    const existingEvents = await getAllEvents()
    const existingIds = new Set(existingEvents.map(e => e.id))
    for (const evt of data.events) {
        if (!existingIds.has(evt.id)) {
            await addEvent(evt)
            evtCount++
        }
    }

    return { events: evtCount, categories: catCount }
}
