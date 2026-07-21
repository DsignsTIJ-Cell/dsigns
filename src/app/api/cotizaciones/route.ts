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
    const { items, clienteId, tipoCambio, monedaAnticipo, ...data } = body;

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
    const tc = tipoCambio || 17.5;
    const moneda = monedaAnticipo || "MXN";
    const anticipo = moneda === "USD" ? (total * 0.5) / tc : total * 0.5;
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
        anticipo,
        monedaAnticipo: moneda,
        totalUSD,
        clienteId,
        items: {
          create: items.map((item: Record<string, unknown>, i: number) => ({
            codigo: item.codigo || "",
            descripcion: item.descripcion || "",
            alto: Number(item.alto) || 0,
            ancho: Number(item.ancho) || 0,
            area: Number(item.area) || 0,
            unidadMedida: String(item.unidadMedida || "pie2"),
            precioBaseM2: Number(item.precioBaseM2) || 0,
            precioBaseTotal: Number(item.precioBaseTotal) || 0,
            utilidadPorcentaje: Number(item.utilidadPorcentaje) || 50,
            montoUtilidad: Number(item.montoUtilidad) || 0,
            precioUnitario: Number(item.precioUnitario) || 0,
            cantidad: Number(item.cantidad) || 0,
            total: Number(item.total) || 0,
            opcion: item.opcion || "",
            orden: item.orden ?? i,
          })),
        },
      },
      include: { cliente: true, items: { orderBy: { orden: "asc" } } },
    });

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

    if (items) {
      await db.cotizacionItem.deleteMany({ where: { cotizacionId: id } });

      const subtotal = items.reduce((sum: number, it: { total: number }) => sum + it.total, 0);
      const config = await db.configuracion.findFirst();
      const ivaPct = (config?.ivaPorcentaje || 8) / 100;
      const isrPct = (config?.retencionISRPorcentaje || 1.25) / 100;
      const iva = subtotal * ivaPct;
      const retISR = subtotal * isrPct;
      const total = subtotal - iva - retISR;
      const tc = Number(data.tipoCambio) || 17.5;
      const moneda = data.monedaAnticipo || "MXN";
      const anticipo = moneda === "USD" ? (total * 0.5) / tc : total * 0.5;

      const cotizacion = await db.cotizacion.update({
        where: { id },
        data: {
          ...data,
          subtotal,
          iva,
          retISR,
          total,
          anticipo,
          monedaAnticipo: moneda,
          totalUSD: total / tc,
          items: {
            create: items.map((item: Record<string, unknown>, i: number) => ({
              codigo: item.codigo || "",
              descripcion: item.descripcion || "",
              alto: Number(item.alto) || 0,
              ancho: Number(item.ancho) || 0,
              area: Number(item.area) || 0,
              unidadMedida: String(item.unidadMedida || "pie2"),
              precioBaseM2: Number(item.precioBaseM2) || 0,
              precioBaseTotal: Number(item.precioBaseTotal) || 0,
              utilidadPorcentaje: Number(item.utilidadPorcentaje) || 50,
              montoUtilidad: Number(item.montoUtilidad) || 0,
              precioUnitario: Number(item.precioUnitario) || 0,
              cantidad: Number(item.cantidad) || 0,
              total: Number(item.total) || 0,
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