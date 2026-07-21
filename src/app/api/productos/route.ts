import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const soloActivos = searchParams.get("activos") === "true";

    const productos = await db.producto.findMany({
      where: {
        ...(soloActivos ? { activo: true } : {}),
        ...(search
          ? {
              OR: [
                { codigo: { contains: search } },
                { descripcion: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { codigo: "asc" },
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const producto = await db.producto.create({ data: body });
    return NextResponse.json(producto, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "Código ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const producto = await db.producto.update({ where: { id }, data });
    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await db.producto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}