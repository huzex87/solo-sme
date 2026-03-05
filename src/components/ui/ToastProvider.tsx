'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type} animate-slide-up`}>
                        <div className="toast-content">
                            {toast.type === 'success' && <CheckCircle size={18} className="text-success" />}
                            {toast.type === 'error' && <XCircle size={18} className="text-error" />}
                            {toast.type === 'info' && <Info size={18} className="text-info" />}
                            <span>{toast.message}</span>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
        }
        .toast {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: rgba(18, 18, 20, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          color: white;
          font-weight: 600;
          min-width: 320px;
          pointer-events: auto;
        }
        .toast-success { border-left: 4px solid var(--color-success); }
        .toast-error { border-left: 4px solid var(--color-error); }
        .toast-info { border-left: 4px solid var(--accent-primary); }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9375rem;
        }
        .text-success { color: var(--color-success); }
        .text-error { color: var(--color-error); }
        .text-info { color: var(--accent-primary); }
      `}</style>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
