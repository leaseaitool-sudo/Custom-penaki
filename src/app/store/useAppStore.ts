import { create } from 'zustand';
import { View, User, SupportChat } from '@/shared/types';

interface AppState {
    isAuthModalOpen: boolean;
    isSidebarOpen: boolean;
    authModalInitialView: 'login' | 'signup';
    isDemoModalOpen: boolean;
    
    // Auth Modals
    openAuthModal: (view: 'login' | 'signup') => void;
    closeAuthModal: () => void;
    
    // Sidebar
    toggleSidebar: () => void;
    closeSidebar: () => void;
    
    // Demo Modal
    openDemoModal: () => void;
    closeDemoModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    isAuthModalOpen: false,
    isSidebarOpen: false,
    authModalInitialView: 'signup',
    isDemoModalOpen: false,
    
    openAuthModal: (view) => set({ isAuthModalOpen: true, authModalInitialView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),
    
    openDemoModal: () => set({ isDemoModalOpen: true }),
    closeDemoModal: () => set({ isDemoModalOpen: false }),
}));
