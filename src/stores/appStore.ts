import { create } from "zustand";
import type { AppTab } from "@/types";

interface AppState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "cotizaciones",
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));