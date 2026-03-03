import { NextRequest, NextResponse } from "next/server";
import { createSale } from "@/lib/services/inventory";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({
    include: { saleLines: { include: { woodItem: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sale = await createSale(body);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
