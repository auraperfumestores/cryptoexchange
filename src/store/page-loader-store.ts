import { create } from 'zustand';

interface PageLoaderState {
  visible: boolean;
  fading: boolean;
  show: () => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const usePageLoaderStore = create<PageLoaderState>((set) => ({
  visible: false,
  fading: false,
  show: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, fading: false });
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ fading: true });
    hideTimer = setTimeout(() => set({ visible: false, fading: false }), 380);
  },
}));

// Usable outside React (plain async functions, route handlers' client helpers, etc.)
export const pageLoader = {
  show: () => usePageLoaderStore.getState().show(),
  hide: () => usePageLoaderStore.getState().hide(),
};
