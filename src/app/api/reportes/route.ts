import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCotizaciones = await db.cotizacion.findMany({
      include: { cliente: true, items: true },
      orderBy: { fecha: "desc" },
    });

    // ===== KPIs generales =====
    const totalCotizaciones = allCotizaciones.length;
    const sumaTotal = allCotizaciones.reduce((s, c) => s + c.total, 0);
    const sumaAnticipos = allCotizaciones.reduce((s, c) => s + c.anticipo, 0);
    const aprobadas = allCotizaciones.filter(
      (c) => c.estado === "aprobada" || c.estado === "convertida" || c.estado === "pagada"
    ).length;
    const tasaAprobacion = totalCotizaciones > 0 ? Math.round((aprobadas / totalCotizaciones) * 100) : 0;

    // ===== Por mes (últimos 6 meses) =====
    const meses: { mes: string; total: number; cantidad: number; aprobadas: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesNombre = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const delMes = allCotizaciones.filter((c) => {
        const f = new Date(c.fecha);
        return f >= start && f <= end;
      });
      const aprobadasMes = delMes.filter(
        (c) => c.estado === "aprobada" || c.estado === "convertida" || c.estado === "pagada"
      ).length;

      meses.push({
        mes: mesNombre,
        total: Math.round(delMes.reduce((s, c) => s + c.total, 0) * 100) / 100,
        cantidad: delMes.length,
        aprobadas: aprobadasMes,
      });
    }

    // ===== Por estado (pastel) =====
    const estadoLabels: Record<string, string> = {
      pendiente: "Pendiente",
      aprobada: "Aprobada",
      rechazada: "Rechazada",
      convertida: "Convertida",
      pagada: "Pagada",
    };
    const porEstado: { estado: string; label: string; cantidad: number; total: number }[] = Object.entries(
      allCotizaciones.reduce(
        (acc, c) => {
          if (!acc[c.estado]) acc[c.estado] = { cantidad: 0, total: 0 };
          acc[c.estado].cantidad++;
          acc[c.estado].total += c.total;
          return acc;
        },
        {} as Record<string, { cantidad: number; total: number }>
      )
    ).map(([estado, data]) => ({
      estado,
      label: estadoLabels[estado] || estado,
      cantidad: data.cantidad,
      total: Math.round(data.total * 100) / 100,
    }));

    // ===== Top 5 clientes por monto total =====
    const clienteMap: Record<string, { nombre: string; empresa: string; total: number; cantidad: number }> = {};
    for (const c of allCotizaciones) {
      const key = c.clienteId;
      if (!clienteMap[key]) {
        clienteMap[key] = {
          nombre: c.cliente?.nombre || "Sin cliente",
          empresa: c.cliente?.empresa || "",
          total: 0,
          cantidad: 0,
        };
      }
      clienteMap[key].total += c.total;
      clienteMap[key].cantidad++;
    }
    const topClientes = Object.values(clienteMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }));

    return NextResponse.json({
      kpis: {
        totalCotizaciones,
        sumaTotal: Math.round(sumaTotal * 100) / 100,
        sumaAnticipos: Math.round(sumaAnticipos * 100) / 100,
        tasaAprobacion,
        aprobadas,
      },
      porMes: meses,
      porEstado,
      topClientes,
    });
  } catch (error) {
    console.error("Error al generar reportes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}