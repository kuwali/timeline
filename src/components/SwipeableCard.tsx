import { useRef, useState, useCallback, type ReactNode } from 'react'

interface SwipeableCardProps {
    children: ReactNode
    onSwipeLeft: () => void  // delete
    onSwipeRight: () => void // edit
}

const THRESHOLD = 80
const MAX_SWIPE = 120

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight }: SwipeableCardProps) {
    const startX = useRef(0)
    const startY = useRef(0)
    const [offset, setOffset] = useState(0)
    const [swiping, setSwiping] = useState(false)
    const [locked, setLocked] = useState(false) // lock direction after first significant move

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
        startY.current = e.touches[0].clientY
        setSwiping(true)
        setLocked(false)
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!swiping) return
        const dx = e.touches[0].clientX - startX.current
        const dy = e.touches[0].clientY - startY.current

        // If vertical scroll is dominant, cancel swipe
        if (!locked && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
            setSwiping(false)
            setOffset(0)
            return
        }

        if (Math.abs(dx) > 10) setLocked(true)

        const clamped = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, dx))
        setOffset(clamped)
    }, [swiping, locked])

    const handleTouchEnd = useCallback(() => {
        if (offset > THRESHOLD) {
            onSwipeRight()
        } else if (offset < -THRESHOLD) {
            onSwipeLeft()
        }
        setOffset(0)
        setSwiping(false)
        setLocked(false)
    }, [offset, onSwipeLeft, onSwipeRight])

    const absOffset = Math.abs(offset)
    const revealOpacity = Math.min(1, absOffset / THRESHOLD)

    return (
        <div className="swipeable-card">
            {/* Background reveal layers */}
            <div
                className="swipeable-card__reveal swipeable-card__reveal--edit"
                style={{ opacity: offset > 0 ? revealOpacity : 0 }}
            >
                <span className="swipeable-card__reveal-icon">✏️ Edit</span>
            </div>
            <div
                className="swipeable-card__reveal swipeable-card__reveal--delete"
                style={{ opacity: offset < 0 ? revealOpacity : 0 }}
            >
                <span className="swipeable-card__reveal-icon">🗑 Delete</span>
            </div>

            {/* Foreground card */}
            <div
                className="swipeable-card__content"
                style={{
                    transform: `translateX(${offset}px)`,
                    transition: swiping ? 'none' : 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    )
}
