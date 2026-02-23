interface TimelineDividerProps {
    label: string
    variant?: 'year' | 'today'
}

export function TimelineDivider({ label, variant = 'year' }: TimelineDividerProps) {
    return (
        <div className={`timeline-divider timeline-divider--${variant}`}>
            <div className="timeline-divider__line" />
            <span className="timeline-divider__label">{label}</span>
            <div className="timeline-divider__line" />
        </div>
    )
}
