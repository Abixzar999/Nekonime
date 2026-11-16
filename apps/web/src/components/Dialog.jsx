import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import "./Dialog.css";

// Dialog modal bawaan browser (<dialog>): fokus terkunci di dalamnya, Esc menutup,
// dan latar di belakangnya mengabur lembut. Dirender hanya saat dibutuhkan.
function Dialog({ title, message, icon = "trash", actions = [], cancelLabel = "Batal", onClose }) {
  const ref = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    cancelRef.current?.focus(); // fokus awal di tombol aman (Batal)
    return () => {
      document.documentElement.classList.remove("dialog-open");
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="nk-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="nk-dialog__box">
        <span className="nk-dialog__icon" aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
        <h2 className="nk-dialog__title" id={titleId}>{title}</h2>
        <p className="nk-dialog__message" id={messageId}>{message}</p>
        <div className="nk-dialog__actions">
          <button
            type="button"
            ref={cancelRef}
            className="nk-dialog__btn nk-dialog__btn--ghost"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`nk-dialog__btn nk-dialog__btn--${action.tone || "primary"}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

export default Dialog;
