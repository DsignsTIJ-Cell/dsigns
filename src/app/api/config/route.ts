import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let config = await db.configuracion.findFirst();
    if (!config) {
      config = await db.configuracion.create({
        data: {
          nombreEmpresa: "Dsigns",
          telefono: "663 4917254",
          correo: "dsigns.tij@gmail.com",
          asesor: "Daniel Sepúlveda Ruíz",
          asesorTelefono: "6647297867",
          ivaPorcentaje: 8,
          retencionISRPorcentaje: 1.25,
          vigenciaDias: 15,
          siguienteCotizacionNum: 1348,
          terminosCondiciones:
            "1. Solicitud de trabajo se dara 50% de anticipo para iniciar el trabajo.\n2. Servicio urgente se paga el 100% al entregar el pedido.\n3. Si requiere factura, se solicitara en un periodo maximo de 48 hrs.\n4. Se requiere la Constancia de Situación Fiscal para generar la factura.\n5. Proyectos terminados, se entregan a domicilio en la ciudad de Tijuana sin costo.\nNota: Fuera de la ciudad se genera un gasto adicional de envío.\nPrecios en Moneda Nacional.",
        },
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const config = await db.configuracion.findFirst();
    if (!config) {
      return NextResponse.json({ error: "No hay configuración" }, { status: 404 });
    }
    const updated = await db.configuracion.update({
      where: { id: config.id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}