import { useState } from 'react'

// ── OS & Context Detection ───────────────────────────────────────

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/i.test(ua)) return 'ios'
    if (/Android/i.test(ua)) return 'android'
    return 'desktop'
}

function isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as any).standalone === true
}

// ── Slide Data ───────────────────────────────────────────────────

interface Slide {
    icon: string
    title: string
    body: React.ReactNode
}

function getSlides(): Slide[] {
    const platform = detectPlatform()
    const alreadyInstalled = isPWA()

    return [
        {
            icon: '⏳',
            title: 'Welcome to Timeline',
            body: (
                <div className="onboarding__text">
                    <p>
                        Track the moments that matter — birthdays, milestones,
                        upcoming trips, and life events — all in one beautiful timeline.
                    </p>
                    <p>
                        Every event shows a <strong>live counter</strong> of days elapsed
                        or remaining, so you always know how far you've come and what's ahead.
                    </p>
                </div>
            ),
        },
        {
            icon: '✨',
            title: 'Quick Tour',
            body: (
                <div className="onboarding__text">
                    <ul className="onboarding__features">
                        <li>
                            <span className="onboarding__feature-icon">➕</span>
                            <span>Tap <strong>+ Add</strong> to create your first event</span>
                        </li>
                        <li>
                            <span className="onboarding__feature-icon">🏷️</span>
                            <span>Organize with <strong>categories</strong> like Birthday, Travel, Work</span>
                        </li>
                        <li>
                            <span className="onboarding__feature-icon">🔁</span>
                            <span>Set events as <strong>recurring yearly</strong> for birthdays & anniversaries</span>
                        </li>
                        <li>
                            <span className="onboarding__feature-icon">📅</span>
                            <span>Add <strong>date ranges</strong> for trips and multi-day events</span>
                        </li>
                        <li>
                            <span className="onboarding__feature-icon">☰</span>
                            <span>Use the <strong>menu</strong> to switch themes, export data, and more</span>
                        </li>
                    </ul>
                </div>
            ),
        },
        {
            icon: alreadyInstalled ? '🎉' : '📲',
            title: alreadyInstalled ? "You're All Set!" : 'Install as App',
            body: alreadyInstalled ? (
                <div className="onboarding__text">
                    <p>
                        You've already installed Timeline as an app.
                        Enjoy the full experience!
                    </p>
                </div>
            ) : (
                <div className="onboarding__text">
                    <p>
                        For the best experience, install Timeline on your home screen.
                        It works <strong>fully offline</strong> — your data stays on your device.
                    </p>
                    {platform === 'ios' && (
                        <div className="onboarding__install-steps">
                            <p className="onboarding__install-label">On iPhone / iPad (Safari):</p>
                            <ol>
                                <li>Tap the <strong>Share</strong> button <span className="onboarding__key">↗</span> at the bottom of Safari</li>
                                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                                <li>Tap <strong>"Add"</strong> in the top right</li>
                            </ol>
                        </div>
                    )}
                    {platform === 'android' && (
                        <div className="onboarding__install-steps">
                            <p className="onboarding__install-label">On Android (Chrome):</p>
                            <ol>
                                <li>Tap the <strong>⋮ menu</strong> in the top right</li>
                                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                                <li>Tap <strong>"Install"</strong> to confirm</li>
                            </ol>
                        </div>
                    )}
                    {platform === 'desktop' && (
                        <div className="onboarding__install-steps">
                            <p className="onboarding__install-label">On Desktop (Chrome / Edge):</p>
                            <ol>
                                <li>Look for the <strong>install icon</strong> <span className="onboarding__key">⊕</span> in the address bar</li>
                                <li>Click <strong>"Install"</strong></li>
                            </ol>
                            <p className="onboarding__install-note">
                                You can also find it in the browser menu under "Install Timeline"
                            </p>
                        </div>
                    )}
                </div>
            ),
        },
    ]
}

// ── Component ────────────────────────────────────────────────────

interface OnboardingTutorialProps {
    onComplete: () => void
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
    const [step, setStep] = useState(0)
    const slides = getSlides()
    const isLast = step === slides.length - 1
    const current = slides[step]

    function handleNext() {
        if (isLast) {
            onComplete()
        } else {
            setStep(s => s + 1)
        }
    }

    function handleBack() {
        setStep(s => Math.max(0, s - 1))
    }

    function handleSkip() {
        onComplete()
    }

    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === e.currentTarget) handleSkip()
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal aria-label="Onboarding">
            <div className="onboarding">
                {/* Skip button */}
                <button className="onboarding__skip" onClick={handleSkip} aria-label="Skip tutorial">
                    Skip
                </button>

                {/* Slide content */}
                <div className="onboarding__slide">
                    <div className="onboarding__icon">{current.icon}</div>
                    <h2 className="onboarding__title">{current.title}</h2>
                    {current.body}
                </div>

                {/* Dots */}
                <div className="onboarding__dots">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`onboarding__dot ${i === step ? 'onboarding__dot--active' : ''}`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="onboarding__nav">
                    {step > 0 ? (
                        <button className="btn btn--ghost" onClick={handleBack}>Back</button>
                    ) : (
                        <div />
                    )}
                    <button className="btn btn--primary" onClick={handleNext}>
                        {isLast ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}
