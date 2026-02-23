import { useState, useRef, useEffect } from 'react'
import type { Category } from '../types/Category'

interface SettingsMenuProps {
    theme: string
    sortMode: string
    updateAvailable: boolean
    checking: boolean
    onToggleTheme: () => void
    onToggleSortMode: () => void
    onExport: () => void
    onImport: () => void
    onManageCategories: () => void
    onCheckForUpdates: () => void
    categories: Category[]
}

export function SettingsMenu({
    theme,
    sortMode,
    updateAvailable,
    checking,
    onToggleTheme,
    onToggleSortMode,
    onExport,
    onImport,
    onManageCategories,
    onCheckForUpdates,
}: SettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    // Close on escape
    useEffect(() => {
        if (!isOpen) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen])

    return (
        <div className="settings-menu" ref={menuRef}>
            <button
                className="btn btn--ghost btn--sm btn--icon settings-menu__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Settings"
                aria-expanded={isOpen}
                title="Settings"
            >
                ☰
            </button>

            {isOpen && (
                <div className="settings-menu__dropdown">
                    <div className="settings-menu__section">
                        <button className="settings-menu__item" onClick={() => { onToggleTheme(); setIsOpen(false) }}>
                            <span className="settings-menu__icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button className="settings-menu__item" onClick={() => { onToggleSortMode(); setIsOpen(false) }}>
                            <span className="settings-menu__icon">{sortMode === 'auto' ? '✋' : '📊'}</span>
                            <span>{sortMode === 'auto' ? 'Manual Sort' : 'Auto Sort'}</span>
                        </button>
                    </div>

                    <div className="settings-menu__divider" />

                    <div className="settings-menu__section">
                        <button className="settings-menu__item" onClick={() => { onManageCategories(); setIsOpen(false) }}>
                            <span className="settings-menu__icon">🏷️</span>
                            <span>Manage Categories</span>
                        </button>
                    </div>

                    <div className="settings-menu__divider" />

                    <div className="settings-menu__section">
                        <button className="settings-menu__item" onClick={() => { onExport(); setIsOpen(false) }}>
                            <span className="settings-menu__icon">📤</span>
                            <span>Export Data</span>
                        </button>
                        <button className="settings-menu__item" onClick={() => { onImport(); setIsOpen(false) }}>
                            <span className="settings-menu__icon">📥</span>
                            <span>Import Data</span>
                        </button>
                    </div>

                    <div className="settings-menu__divider" />

                    <div className="settings-menu__section">
                        <button
                            className={`settings-menu__item ${updateAvailable ? 'settings-menu__item--highlight' : ''}`}
                            onClick={() => { onCheckForUpdates(); setIsOpen(false) }}
                            disabled={checking}
                        >
                            <span className="settings-menu__icon">{checking ? '⏳' : '🔄'}</span>
                            <span>
                                {checking
                                    ? 'Checking…'
                                    : updateAvailable
                                        ? 'Update Available — Install Now'
                                        : 'Check for Updates'}
                            </span>
                        </button>
                    </div>

                    <div className="settings-menu__footer">
                        Timeline Tracker v1.6
                    </div>
                </div>
            )}
        </div>
    )
}
