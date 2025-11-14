'use client';

import { useState, useCallback } from 'react';
import Toast from '@/components/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  show: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    show: false,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, show: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const ToastComponent = toast.show ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
