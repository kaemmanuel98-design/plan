import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'ok' | 'err' | 'info';
  show: (message: string, type?: 'ok' | 'err' | 'info') => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  clear: () => set({ message: null }),
}));
