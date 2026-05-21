import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} max-h-[92dvh] flex flex-col animate-fadeIn rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors">
            <HiX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
