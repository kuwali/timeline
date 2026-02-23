import { useState, useEffect } from 'react'
import type { TimelineEvent } from '../types/TimelineEvent'
import type { Category } from '../types/Category'
import { getDetailedCountdown, isInPast, getNextOccurrence, formatDateDetailed } from '../utils/timeCalc'

interface EventDetailModalProps {
    event: TimelineEvent | null
    category: Category | undefined
    isOpen: boolean
    onClose: () => void
    onEdit: (event: TimelineEvent) => void
    onDelete: (id: string) => void
    onExport: (event: TimelineEvent) => void
}

export function EventDetailModal({
    event,
    category,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onExport
}: EventDetailModalProps) {
    const [now, setNow] = useState(new Date())

    // Live ticker
    useEffect(() => {
        if (!isOpen) return
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [isOpen])

    // Handle escape key
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !event) return null

    // Calculate effective date
    let effectiveDate = new Date(event.anchorDate)
    if (event.recurrenceRule) {
        const next = getNextOccurrence(effectiveDate, event.recurrenceRule)
        // If it's a past event and we are looking at its detail, we might want to see the specific past occurrence it represents, but for recurrence we usually care about the *next* one.
        // For now we use the next occurrence.
        effectiveDate = next
    }

    const isPast = isInPast(effectiveDate)
    const countdown = getDetailedCountdown(effectiveDate, now)

    const icon = category?.icon || '📌'
    const color = category?.color || '#6b7fa3'
    const catName = category?.name || 'Other'

    return (
        <div className="modal-backdrop" onClick={onClose} aria-hidden={!isOpen}>
            <div
                className="modal detail-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="detail-title"
            >
                <div className="detail-modal__header">
                    <div className="detail-modal__icon" style={{ backgroundColor: `${color}15`, color }}>
                        {icon}
                    </div>
                    <button className="icon-btn" onClick={onClose} aria-label="Close details">
                        ✕
                    </button>
                </div>

                <div className="detail-modal__body">
                    <h2 id="detail-title" className="detail-modal__title">{event.title}</h2>

                    <div className="detail-modal__meta">
                        <span className="detail-modal__category" style={{ color, borderColor: color }}>
                            {catName}
                        </span>
                        <span className="detail-modal__date">
                            {formatDateDetailed(effectiveDate, event.isAllDay !== false)}
                            {event.endDate ? ` - ${formatDateDetailed(new Date(event.endDate), event.isAllDay !== false)}` : ''}
                        </span>
                    </div>

                    <div className="detail-modal__countdown-box">
                        <div className="detail-modal__countdown-label">
                            {isPast ? 'Time elapsed since event' : 'Time remaining until event'}
                        </div>
                        <div className="detail-modal__countdown">
                            {countdown.years > 0 && <div className="countdown-unit"><span className="countdown-val">{countdown.years}</span><span className="countdown-lbl">yrs</span></div>}
                            {(countdown.years > 0 || countdown.months > 0) && <div className="countdown-unit"><span className="countdown-val">{countdown.months}</span><span className="countdown-lbl">mos</span></div>}
                            {(countdown.years > 0 || countdown.months > 0 || countdown.days > 0) && <div className="countdown-unit"><span className="countdown-val">{countdown.days}</span><span className="countdown-lbl">dys</span></div>}
                            <div className="countdown-unit"><span className="countdown-val">{countdown.hours.toString().padStart(2, '0')}</span><span className="countdown-lbl">hrs</span></div>
                            <div className="countdown-unit"><span className="countdown-val">{countdown.minutes.toString().padStart(2, '0')}</span><span className="countdown-lbl">min</span></div>
                            <div className="countdown-unit"><span className="countdown-val">{countdown.seconds.toString().padStart(2, '0')}</span><span className="countdown-lbl">sec</span></div>
                        </div>
                    </div>
                </div>

                <div className="detail-modal__actions">
                    <button
                        className="btn btn--ghost detail-modal__btn"
                        onClick={() => onExport(event)}
                    >
                        📅 Export .ics
                    </button>
                    <div className="detail-modal__actions-right">
                        <button
                            className="btn btn--ghost detail-modal__btn"
                            onClick={() => { onClose(); onEdit(event) }}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            className="btn btn--danger detail-modal__btn"
                            onClick={() => { onClose(); onDelete(event.id) }}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
