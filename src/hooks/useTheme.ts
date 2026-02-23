import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // 1. Check local storage
        const saved = localStorage.getItem('timeline-theme') as Theme | null
        if (saved === 'light' || saved === 'dark') return saved

        // 2. Check OS preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light'
        }

        // Default to dark
        return 'dark'
    })

    useEffect(() => {
        const root = document.documentElement
        if (theme === 'light') {
            root.classList.add('theme-light')
        } else {
            root.classList.remove('theme-light')
        }
        localStorage.setItem('timeline-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return { theme, toggleTheme }
}
