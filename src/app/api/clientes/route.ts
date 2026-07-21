import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const clientes = await db.cliente.findMany({
      where: search
        ? {
            OR: [
              { nombre: { contains: search } },
              { empresa: { contains: search } },
              { clienteId: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cliente = await db.cliente.create({ data: body });
    return NextResponse.json(cliente, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "Cliente ID ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const cliente = await db.cliente.update({ where: { id }, data });
    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await db.cliente.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}