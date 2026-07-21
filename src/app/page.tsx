"use client";

import { useAppStore } from "@/stores/appStore";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { PanelCotizaciones } from "@/components/app/PanelCotizaciones";
import { PanelCatalogo } from "@/components/app/PanelCatalogo";
import { PanelClientes } from "@/components/app/PanelClientes";
import { PanelReportes } from "@/components/app/PanelReportes";
import { PanelConfiguracion } from "@/components/app/PanelConfiguracion";
import { CotizacionForm } from "@/components/app/CotizacionForm";

const panels: Record<string, React.ReactNode> = {
  cotizaciones: <PanelCotizaciones />,
  catalogo: <PanelCatalogo />,
  clientes: <PanelClientes />,
  reportes: <PanelReportes />,
  configuracion: <PanelConfiguracion />,
};

export default function Home() {
  const { activeTab, creatingCotizacion } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 px-4 py-4 pb-24">
        {activeTab === "cotizaciones" && creatingCotizacion ? (
          <CotizacionForm />
        ) : (
          panels[activeTab]
        )}
      </main>
      <BottomNav />
    </div>
  );
}