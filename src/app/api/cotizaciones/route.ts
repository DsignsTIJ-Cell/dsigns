import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const search = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (estado && estado !== "todos") where.estado = estado;
    if (search) {
      where.OR = [
        { numeroCotizacion: { contains: search } },
        { cliente: { nombre: { contains: search } } },
        { cliente: { empresa: { contains: search } } },
      ];
    }

    const [cotizaciones, total] = await Promise.all([
      db.cotizacion.findMany({
        where,
        include: { cliente: true, items: { orderBy: { orden: "asc" } } },
        orderBy: { fecha: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.cotizacion.count({ where }),
    ]);

    return NextResponse.json({ data: cotizaciones, total, page, limit });
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, clienteId, tipoCambio, ...data } = body;

    // Obtener siguiente número de cotización
    const config = await db.configuracion.findFirst();
    const num = config?.siguienteCotizacionNum || 1348;
    const numeroCotizacion = `S0${num}`;

    const fecha = new Date();
    const validoHasta = new Date(fecha);
    validoHasta.setDate(validoHasta.getDate() + (config?.vigenciaDias || 15));

    const subtotal = items.reduce((sum: number, it: { total: number }) => sum + it.total, 0);
    const ivaPct = (config?.ivaPorcentaje || 8) / 100;
    const isrPct = (config?.retencionISRPorcentaje || 1.25) / 100;
    const iva = subtotal * ivaPct;
    const retISR = subtotal * isrPct;
    const total = subtotal - iva - retISR;
    const tc = tipoCambio || config?.ivaPorcentaje || 17.5;
    const anticipoUSD = (total * 0.5) / tc;
    const totalUSD = total / tc;

    const cotizacion = await db.cotizacion.create({
      data: {
        ...data,
        numeroCotizacion,
        fecha,
        validoHasta,
        tipoCambio: tc,
        asesor: config?.asesor || "",
        subtotal,
        iva,
        retISR,
        total,
        anticipoUSD,
        totalUSD,
        clienteId,
        items: {
          create: items.map((item: { opcion: string; orden: number }, i: number) => ({
            ...item,
            opcion: item.opcion || "",
            orden: item.orden ?? i,
          })),
        },
      },
      include: { cliente: true, items: { orderBy: { orden: "asc" } } },
    });

    // Actualizar siguiente número
    if (config) {
      await db.configuracion.update({
        where: { id: config.id },
        data: { siguienteCotizacionNum: num + 1 },
      });
    }

    return NextResponse.json(cotizacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear cotización:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, items, ...data } = body;

    // Si hay items nuevos, eliminar los viejos y crear los nuevos
    if (items) {
      await db.cotizacionItem.deleteMany({ where: { cotizacionId: id } });

      const subtotal = items.reduce((sum: number, it: { total: number }) => sum + it.total, 0);
      const config = await db.configuracion.findFirst();
      const ivaPct = (config?.ivaPorcentaje || 8) / 100;
      const isrPct = (config?.retencionISRPorcentaje || 1.25) / 100;
      const iva = subtotal * ivaPct;
      const retISR = subtotal * isrPct;
      const total = subtotal - iva - retISR;
      const tc = data.tipoCambio || 17.5;

      const cotizacion = await db.cotizacion.update({
        where: { id },
        data: {
          ...data,
          subtotal,
          iva,
          retISR,
          total,
          anticipoUSD: (total * 0.5) / tc,
          totalUSD: total / tc,
          items: {
            create: items.map((item: { opcion: string; orden: number }, i: number) => ({
              ...item,
              opcion: item.opcion || "",
              orden: item.orden ?? i,
            })),
          },
        },
        include: { cliente: true, items: { orderBy: { orden: "asc" } } },
      });
      return NextResponse.json(cotizacion);
    }

    const cotizacion = await db.cotizacion.update({
      where: { id },
      data,
      include: { cliente: true, items: { orderBy: { orden: "asc" } } },
    });
    return NextResponse.json(cotizacion);
  } catch (error) {
    console.error("Error al actualizar cotización:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await db.cotizacion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar cotización:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}