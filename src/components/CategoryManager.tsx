import { useState } from 'react'
import type { Category } from '../types/Category'

const EMOJI_OPTIONS = ['❤️', '💼', '✈️', '💪', '🏆', '🎂', '📌', '🎓', '🏠', '🌟', '🎯', '📅', '🌍', '🚀', '🎉', '🧘', '🎵', '📸', '🐾', '⚽', '🎮', '🍔', '💰', '🔬']
const COLOR_OPTIONS = ['#a78bfa', '#60a5fa', '#34d399', '#f87171', '#fbbf24', '#f472b6', '#6b7fa3', '#fb923c', '#22d3ee', '#a3e635', '#e879f9', '#f43f5e']

interface CategoryManagerProps {
    isOpen: boolean
    categories: Category[]
    onAdd: (cat: Omit<Category, 'id'>) => void
    onEdit: (cat: Category) => void
    onDelete: (id: string) => void
    onClose: () => void
}

export function CategoryManager({ isOpen, categories, onAdd, onEdit, onDelete, onClose }: CategoryManagerProps) {
    const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
    const [editingCat, setEditingCat] = useState<Category | null>(null)
    const [name, setName] = useState('')
    const [icon, setIcon] = useState('📌')
    const [color, setColor] = useState('#6b7fa3')

    function resetForm() {
        setName('')
        setIcon('📌')
        setColor('#6b7fa3')
        setEditingCat(null)
        setMode('list')
    }

    function handleAddStart() {
        resetForm()
        setMode('add')
    }

    function handleEditStart(cat: Category) {
        setEditingCat(cat)
        setName(cat.name)
        setIcon(cat.icon)
        setColor(cat.color)
        setMode('edit')
    }

    function handleSave() {
        if (!name.trim()) return
        if (mode === 'edit' && editingCat) {
            onEdit({ ...editingCat, name: name.trim(), icon, color })
        } else {
            onAdd({ name: name.trim(), icon, color })
        }
        resetForm()
    }

    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === e.currentTarget) {
            resetForm()
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal aria-label="Manage categories">
            <div className="modal cat-manager">
                <div className="modal__header">
                    <h2 className="modal__title">
                        {mode === 'list' ? 'Categories' : mode === 'add' ? 'New Category' : 'Edit Category'}
                    </h2>
                    <button className="icon-btn" onClick={() => { resetForm(); onClose() }} aria-label="Close">✕</button>
                </div>

                {mode === 'list' ? (
                    <div className="cat-manager__list">
                        {categories.map(cat => (
                            <div key={cat.id} className="cat-manager__item">
                                <span className="cat-manager__icon" style={{ background: cat.color + '20', color: cat.color }}>{cat.icon}</span>
                                <span className="cat-manager__name">{cat.name}</span>
                                <div className="cat-manager__item-actions">
                                    <button className="icon-btn" onClick={() => handleEditStart(cat)} aria-label="Edit">✏️</button>
                                    <button className="icon-btn icon-btn--danger" onClick={() => onDelete(cat.id)} aria-label="Delete">🗑</button>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn--primary cat-manager__add-btn" onClick={handleAddStart}>+ Add Category</button>
                    </div>
                ) : (
                    <div className="cat-manager__form">
                        {/* Name */}
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. Education, Fitness…"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Icon */}
                        <div className="form-group">
                            <label className="form-label">Icon</label>
                            <div className="icon-picker">
                                {EMOJI_OPTIONS.map(em => (
                                    <button
                                        key={em}
                                        type="button"
                                        className={`icon-picker__btn ${icon === em ? 'icon-picker__btn--selected' : ''}`}
                                        onClick={() => setIcon(em)}
                                        style={icon === em ? { borderColor: color } : undefined}
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <div className="color-picker">
                                {COLOR_OPTIONS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`color-picker__btn ${color === c ? 'color-picker__btn--selected' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => setColor(c)}
                                        aria-label={c}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={resetForm}>Back</button>
                            <button className="btn btn--primary" onClick={handleSave}>
                                {mode === 'edit' ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
