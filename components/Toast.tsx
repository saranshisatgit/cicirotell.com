'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
          type === 'success'
            ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
        }`}
      >
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
        </div>
        <p
          className={`text-sm font-light ${
            type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`ml-auto flex-shrink-0 ${
            type === 'success'
              ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'
              : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
