interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'default'
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null

    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === e.currentTarget) onCancel()
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdrop} role="alertdialog" aria-modal aria-label={title}>
            <div className="confirm-dialog">
                <div className="confirm-dialog__icon" aria-hidden>
                    {variant === 'danger' ? '⚠️' : 'ℹ️'}
                </div>
                <h2 className="confirm-dialog__title">{title}</h2>
                <p className="confirm-dialog__message">{message}</p>
                <div className="confirm-dialog__actions">
                    <button className="btn btn--ghost" onClick={onCancel}>{cancelLabel}</button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
