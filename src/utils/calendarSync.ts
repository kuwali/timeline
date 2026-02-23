import type { TimelineEvent } from '../types/TimelineEvent'

function formatICSDate(dateStr: string, isAllDay: boolean): string {
    const d = new Date(dateStr)
    const yr = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const da = String(d.getDate()).padStart(2, '0')

    if (isAllDay) {
        return `${yr}${mo}${da}`
    }

    const ho = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    const se = String(d.getSeconds()).padStart(2, '0')

    // Return in UTC format for global compat if we use getUTC*, but local time without Z means floating time
    return `${yr}${mo}${da}T${ho}${mi}${se}`
}

function getICSUID(id: string) {
    return `${id}@personaltimeline.app`
}

export function generateICS(event: TimelineEvent): string {
    const isAllDay = event.isAllDay !== false
    const dtstart = formatICSDate(event.anchorDate, isAllDay)

    let dtend = ''
    if (event.endDate) {
        dtend = `DTEND${isAllDay ? ';VALUE=DATE' : ''}:${formatICSDate(event.endDate, isAllDay)}\n`
    } else if (isAllDay) {
        // For all day events without end, Apple/Google expect DTEND to be the next day
        const nextDay = new Date(event.anchorDate)
        nextDay.setDate(nextDay.getDate() + 1)
        dtend = `DTEND;VALUE=DATE:${formatICSDate(nextDay.toISOString(), true)}\n`
    }

    const now = formatICSDate(new Date().toISOString(), false) + 'Z'

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Personal Timeline Tracker//EN',
        'BEGIN:VEVENT',
        `UID:${getICSUID(event.id)}`,
        `DTSTAMP:${now}`,
        `DTSTART${isAllDay ? ';VALUE=DATE' : ''}:${dtstart}`,
        dtend.trim(),
        `SUMMARY:${event.title}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\n')
}

export function downloadICS(event: TimelineEvent) {
    const icsString = generateICS(event)
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
