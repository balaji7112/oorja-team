import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: number;
  asset?: string;
  read: boolean;
}

interface UIStoreState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  inspectorAsset: string | null;
  notifications: Notification[];
  activeModal: string | null;
  copilotOpen: boolean;
  currentTheme: 'dark';

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setInspectorAsset: (asset: string | null) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  setActiveModal: (modal: string | null) => void;
  setCopilotOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  inspectorAsset: null,
  notifications: [
    {
      id: 'n-1',
      title: 'System Online',
      message: 'OORJA SYNC demo simulation started. All systems operational.',
      type: 'success',
      timestamp: Date.now() - 60000,
      read: false,
    },
    {
      id: 'n-2',
      title: 'Battery Optimized',
      message: 'Charging scheduled based on solar forecast window.',
      type: 'info',
      timestamp: Date.now() - 300000,
      asset: 'BATTERY',
      read: false,
    },
  ],
  activeModal: null,
  copilotOpen: false,
  currentTheme: 'dark',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setInspectorAsset: (asset) => set({ inspectorAsset: asset }),

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: `n-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
    };
    set(s => ({ notifications: [notification, ...s.notifications].slice(0, 20) }));
  },

  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
  })),

  setActiveModal: (modal) => set({ activeModal: modal }),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
}));
