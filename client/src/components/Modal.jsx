import { useState } from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} animate-fadeIn rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-700 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-slate-900 dark:text-white transition-colors">
            <HiX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
