import { create } from "zustand";
import type { AppTab } from "@/types";

interface AppState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  /** Mostrar formulario de nueva cotización */
  creatingCotizacion: boolean;
  setCreatingCotizacion: (v: boolean) => void;
  /** ID de cotización a editar (null = nueva) */
  editingCotizacionId: string | null;
  setEditingCotizacionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "cotizaciones",
  setActiveTab: (tab) => set({ activeTab: tab, creatingCotizacion: false, editingCotizacionId: null }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  creatingCotizacion: false,
  setCreatingCotizacion: (v) => set({ creatingCotizacion: v, editingCotizacionId: null }),
  editingCotizacionId: null,
  setEditingCotizacionId: (id) => set({ editingCotizacionId: id, creatingCotizacion: !!id }),
}));