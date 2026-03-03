import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseNumber } from "@/lib/validators";

export async function GET() {
  const rows = await prisma.woodItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.woodItem.create({
      data: {
        type: String(body.type),
        thickness: parseNumber(body.thickness, "thickness"),
        width: parseNumber(body.width, "width"),
        pricePerMeter: parseNumber(body.pricePerMeter, "pricePerMeter"),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
