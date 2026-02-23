import { useState, useEffect } from 'react'
import type { TimelineEvent, RecurrenceRule } from '../types/TimelineEvent'

const CATEGORIES = ['life', 'work', 'travel', 'health', 'milestone', 'birthday', 'other']
const ICONS = ['🎂', '✈️', '🏆', '💼', '❤️', '🎓', '🏠', '🌟', '🎯', '📅', '💪', '🌍', '🚀', '🎉', '🧘']

interface EventFormProps {
    isOpen: boolean
    initialEvent?: TimelineEvent | null
    onSave: (draft: Omit<TimelineEvent, 'id' | 'sortOrder'>) => void
    onUpdate: (event: TimelineEvent) => void
    onClose: () => void
}

function todayISO(): string {
    return new Date().toISOString().split('T')[0]
}

export function EventForm({ isOpen, initialEvent, onSave, onUpdate, onClose }: EventFormProps) {
    const isEditing = initialEvent != null

    const [title, setTitle] = useState('')
    const [anchorDate, setAnchorDate] = useState(todayISO())
    const [direction, setDirection] = useState<'past' | 'future'>('future')
    const [category, setCategory] = useState<string>('other')
    const [icon, setIcon] = useState<string>('🎯')
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceRule['type'] | ''>('')
    const [displayFormat, setDisplayFormat] = useState<string>('')

    // Populate fields when editing
    useEffect(() => {
        if (initialEvent) {
            setTitle(initialEvent.title)
            setAnchorDate(initialEvent.anchorDate.split('T')[0])
            setDirection(initialEvent.direction)
            setCategory(initialEvent.category ?? 'other')
            setIcon(initialEvent.icon ?? '🎯')
            setRecurrenceType(initialEvent.recurrenceRule?.type ?? '')
            setDisplayFormat(initialEvent.displayFormat ?? '')
        } else {
            setTitle('')
            setAnchorDate(todayISO())
            setDirection('future')
            setCategory('other')
            setIcon('🎯')
            setRecurrenceType('')
            setDisplayFormat('')
        }
    }, [initialEvent, isOpen])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !anchorDate) return

        const draft: Omit<TimelineEvent, 'id' | 'sortOrder'> = {
            title: title.trim(),
            anchorDate,
            direction,
            category,
            icon,
            recurrenceRule: recurrenceType ? { type: recurrenceType } : undefined,
            displayFormat: displayFormat.trim() || undefined,
            notificationConfig: null,
        }

        if (isEditing && initialEvent) {
            onUpdate({ ...draft, id: initialEvent.id, sortOrder: initialEvent.sortOrder })
        } else {
            onSave(draft)
        }
        onClose()
    }

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal aria-label="Event editor">
            <div className="modal">
                <div className="modal__header">
                    <h2 className="modal__title">{isEditing ? 'Edit Event' : 'New Time Anchor'}</h2>
                    <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <form className="modal__form" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="event-title" className="form-label">Title *</label>
                        <input
                            id="event-title"
                            className="form-input"
                            type="text"
                            placeholder="e.g. Japan trip, Birthday, Career start…"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label htmlFor="event-date" className="form-label">Date *</label>
                        <input
                            id="event-date"
                            className="form-input"
                            type="date"
                            value={anchorDate}
                            onChange={e => setAnchorDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Direction */}
                    <div className="form-group">
                        <span className="form-label">Type</span>
                        <div className="toggle-group" role="group" aria-label="Event direction">
                            <button
                                type="button"
                                id="dir-future"
                                className={`toggle-btn ${direction === 'future' ? 'toggle-btn--active' : ''}`}
                                onClick={() => setDirection('future')}
                            >
                                🔮 Upcoming
                            </button>
                            <button
                                type="button"
                                id="dir-past"
                                className={`toggle-btn ${direction === 'past' ? 'toggle-btn--active' : ''}`}
                                onClick={() => setDirection('past')}
                            >
                                📖 Past
                            </button>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="form-group">
                        <label htmlFor="event-recurrence" className="form-label">Recurrence</label>
                        <select
                            id="event-recurrence"
                            className="form-input"
                            value={recurrenceType}
                            onChange={e => setRecurrenceType(e.target.value as RecurrenceRule['type'] | '')}
                        >
                            <option value="">No recurrence</option>
                            <option value="yearly">Every year</option>
                            <option value="monthly">Every month</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label htmlFor="event-category" className="form-label">Category</label>
                        <select
                            id="event-category"
                            className="form-input"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Display Format */}
                    <div className="form-group">
                        <label htmlFor="event-display-format" className="form-label">Display Format</label>
                        <input
                            id="event-display-format"
                            className="form-input"
                            type="text"
                            placeholder="DD MMM YYYY"
                            value={displayFormat}
                            onChange={e => setDisplayFormat(e.target.value)}
                        />
                        <span className="form-hint">
                            Tokens: DD, MM, MMM, MMMM, YY, YYYY — e.g. "DD MMM" → "23 Feb"
                        </span>
                    </div>

                    {/* Icon picker */}
                    <div className="form-group">
                        <span className="form-label">Icon</span>
                        <div className="icon-picker" role="group" aria-label="Choose icon">
                            {ICONS.map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`icon-picker__btn ${icon === i ? 'icon-picker__btn--selected' : ''}`}
                                    onClick={() => setIcon(i)}
                                    aria-label={i}
                                    aria-pressed={icon === i}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="modal__actions">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn--primary">
                            {isEditing ? 'Save Changes' : 'Add to Timeline'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
