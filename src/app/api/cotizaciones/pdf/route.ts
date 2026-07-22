import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { generarPDF } from "@/lib/generarPDF";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Obtener cotización con cliente e items
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

    // Obtener configuración
    const config = await db.configuracion.findFirst();
    if (!config) {
      return NextResponse.json({ error: "Configuración no encontrada" }, { status: 500 });
    }

    // Agregar titulo al tipo si existe
    const cot = {
      ...cotizacion,
      titulo: (cotizacion as Record<string, unknown>).titulo as string || "",
    };

    // Generar PDF
    const pdfBuffer = generarPDF(cot as unknown as import("@/types").Cotizacion, {
      id: config.id,
      nombreEmpresa: config.nombreEmpresa,
      telefono: config.telefono,
      correo: config.correo,
      asesor: config.asesor,
      asesorTelefono: config.asesorTelefono,
      logoUrl: config.logoUrl,
      ivaPorcentaje: config.ivaPorcentaje,
      retencionISRPorcentaje: config.retencionISRPorcentaje,
      utilidadDefault: config.utilidadDefault,
      terminosCondiciones: config.terminosCondiciones,
      vigenciaDias: config.vigenciaDias,
      siguienteCotizacionNum: config.siguienteCotizacionNum,
    });

    // Nombre del archivo
    const tituloSeguro = (cot.titulo || "cotizacion")
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
    const fileName = `${cotizacion.numeroCotizacion}_${tituloSeguro}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    return NextResponse.json({ error: "Error al generar PDF" }, { status: 500 });
  }
}