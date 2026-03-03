import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [stock, sales, remainders] = await Promise.all([
    prisma.stockBatch.findMany({ include: { woodItem: true } }),
    prisma.sale.findMany({ include: { saleLines: true } }),
    prisma.remainder.findMany({ include: { woodItem: true } }),
  ]);

  return NextResponse.json({ stock, sales, remainders });
}
