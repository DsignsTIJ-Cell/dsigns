import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cotizacion = await db.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: { orderBy: { orden: "asc" } },
      },
    });

    if (!cotizacion) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    return NextResponse.json(cotizacion);
  } catch (error) {
    console.error("Error al obtener cotización:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
