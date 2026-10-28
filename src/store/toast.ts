import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (m: string) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: null }), 2600);
  },
}));
