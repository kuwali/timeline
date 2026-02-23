import { useState, useEffect } from 'react'
import type { TimelineEvent, RecurrenceRule } from '../types/TimelineEvent'
import type { Category } from '../types/Category'

const FORMAT_PRESETS = [
    { label: 'Days only (default)', value: '' },
    { label: 'Years, Months, Days', value: 'YY year MM month DD day' },
    { label: 'Months and Days', value: 'MM month DD day' },
    { label: 'Custom…', value: '__custom__' },
]

interface EventFormProps {
    isOpen: boolean
    categories: Category[]
    initialEvent?: TimelineEvent | null
    onSave: (draft: Omit<TimelineEvent, 'id' | 'sortOrder'>) => void
    onUpdate: (event: TimelineEvent) => void
    onClose: () => void
    onManageCategories: () => void
}

function todayISO(): string {
    return new Date().toISOString().split('T')[0]
}

export function EventForm({ isOpen, categories, initialEvent, onSave, onUpdate, onClose, onManageCategories }: EventFormProps) {
    const isEditing = initialEvent != null

    const [title, setTitle] = useState('')
    const [anchorDate, setAnchorDate] = useState(todayISO())
    const [categoryId, setCategoryId] = useState<string>('other')
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceRule['type'] | ''>('')
    const [formatPreset, setFormatPreset] = useState('')
    const [customFormat, setCustomFormat] = useState('')

    useEffect(() => {
        if (initialEvent) {
            setTitle(initialEvent.title)
            setAnchorDate(initialEvent.anchorDate.split('T')[0])
            setCategoryId(initialEvent.categoryId ?? 'other')
            setRecurrenceType(initialEvent.recurrenceRule?.type ?? '')

            // Determine preset or custom
            const fmt = initialEvent.displayFormat ?? ''
            const matchingPreset = FORMAT_PRESETS.find(p => p.value === fmt && p.value !== '__custom__')
            if (matchingPreset) {
                setFormatPreset(fmt)
                setCustomFormat('')
            } else if (fmt) {
                setFormatPreset('__custom__')
                setCustomFormat(fmt)
            } else {
                setFormatPreset('')
                setCustomFormat('')
            }
        } else {
            setTitle('')
            setAnchorDate(todayISO())
            setCategoryId('other')
            setRecurrenceType('')
            setFormatPreset('')
            setCustomFormat('')
        }
    }, [initialEvent, isOpen])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !anchorDate) return

        const displayFormat = formatPreset === '__custom__' ? customFormat.trim() : formatPreset

        const draft: Omit<TimelineEvent, 'id' | 'sortOrder'> = {
            title: title.trim(),
            anchorDate,
            categoryId,
            recurrenceRule: recurrenceType ? { type: recurrenceType } : undefined,
            displayFormat: displayFormat || undefined,
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

    const selectedCategory = categories.find(c => c.id === categoryId)

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
                        <span className="form-hint">Past dates → "days ago" · Future dates → "days until"</span>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <div className="form-label-row">
                            <label htmlFor="event-category" className="form-label">Category</label>
                            <button type="button" className="form-link" onClick={onManageCategories}>Manage →</button>
                        </div>
                        <div className="category-select">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`category-select__btn ${categoryId === cat.id ? 'category-select__btn--selected' : ''}`}
                                    style={categoryId === cat.id ? { borderColor: cat.color, background: cat.color + '15' } : undefined}
                                    onClick={() => setCategoryId(cat.id)}
                                >
                                    <span>{cat.icon}</span>
                                    <span className="category-select__name">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                        {selectedCategory && (
                            <div className="form-hint" style={{ color: selectedCategory.color }}>
                                {selectedCategory.icon} {selectedCategory.name}
                            </div>
                        )}
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

                    {/* Display Format */}
                    <div className="form-group">
                        <label htmlFor="event-format" className="form-label">Display Format</label>
                        <select
                            id="event-format"
                            className="form-input"
                            value={formatPreset}
                            onChange={e => {
                                setFormatPreset(e.target.value)
                                if (e.target.value !== '__custom__') setCustomFormat('')
                            }}
                        >
                            {FORMAT_PRESETS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        {formatPreset === '__custom__' && (
                            <input
                                className="form-input"
                                type="text"
                                placeholder="YY year MM month DD day"
                                value={customFormat}
                                onChange={e => setCustomFormat(e.target.value)}
                            />
                        )}
                        <span className="form-hint">Tokens: YY (years), MM (months), DD (days) — e.g. "YY年 MM月 DD日"</span>
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
