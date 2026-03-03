import { MovementType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseNumber } from "@/lib/validators";

export async function GET() {
  const [batches, remainders, items] = await Promise.all([
    prisma.stockBatch.findMany({ include: { woodItem: true } }),
    prisma.remainder.findMany({ include: { woodItem: true } }),
    prisma.woodItem.findMany(),
  ]);

  const stock = items.map((item) => {
    const batchRows = batches.filter((b) => b.woodItemId === item.id).map((b) => ({
      source: "BATCH",
      length: Number(b.pieceLengthM),
      quantity: b.quantity,
      value: Number(b.pieceLengthM) * b.quantity * Number(item.pricePerMeter),
    }));
    const remRows = remainders.filter((r) => r.woodItemId === item.id).map((r) => ({
      source: "REMAINDER",
      length: Number(r.lengthM),
      quantity: r.quantity,
      value: Number(r.lengthM) * r.quantity * Number(item.pricePerMeter),
    }));

    return {
      item,
      rows: [...batchRows, ...remRows],
    };
  });

  return NextResponse.json(stock);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.stockBatch.create({
      data: {
        woodItemId: parseNumber(body.woodItemId, "woodItemId"),
        pieceLengthM: parseNumber(body.pieceLengthM, "pieceLengthM"),
        quantity: parseNumber(body.quantity, "quantity"),
      },
    });

    await prisma.inventoryMovement.create({
      data: {
        woodItemId: created.woodItemId,
        movementType: MovementType.IN,
        fromLength: null,
        toLength: created.pieceLengthM,
        quantity: created.quantity,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
