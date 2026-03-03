import { MovementType, Prisma } from "@prisma/client";
import { Decimal } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";

type SaleInputLine = {
  woodItemId: number;
  lengthSoldM: string;
  quantity: number;
};

type SaleInput = {
  customerName?: string;
  lines: SaleInputLine[];
};

function toDecimal(value: Prisma.Decimal | string | number): Decimal {
  return new Decimal(value.toString());
}

async function consumeRemainder(
  tx: Prisma.TransactionClient,
  remainderId: number,
  quantityToTake: number,
) {
  const current = await tx.remainder.findUnique({ where: { id: remainderId } });
  if (!current || current.quantity < quantityToTake) {
    throw new Error("Remainder stock changed, please retry");
  }
  const newQty = current.quantity - quantityToTake;
  if (newQty === 0) {
    await tx.remainder.delete({ where: { id: remainderId } });
  } else {
    await tx.remainder.update({ where: { id: remainderId }, data: { quantity: newQty } });
  }
}

async function consumeBatch(tx: Prisma.TransactionClient, batchId: number, quantityToTake: number) {
  const current = await tx.stockBatch.findUnique({ where: { id: batchId } });
  if (!current || current.quantity < quantityToTake) {
    throw new Error("Stock batch changed, please retry");
  }
  const newQty = current.quantity - quantityToTake;
  if (newQty === 0) {
    await tx.stockBatch.delete({ where: { id: batchId } });
  } else {
    await tx.stockBatch.update({ where: { id: batchId }, data: { quantity: newQty } });
  }
}

export async function createSale(input: SaleInput) {
  return prisma.$transaction(async (tx) => {
    let saleTotal = new Decimal(0);
    const pendingLines: Array<{ woodItemId: number; lengthSoldM: Prisma.Decimal; quantity: number; pricePerMeter: Prisma.Decimal; lineTotal: Prisma.Decimal }> = [];

    for (const line of input.lines) {
      const pieceLength = new Decimal(line.lengthSoldM);
      if (pieceLength.lte(0) || line.quantity <= 0) {
        throw new Error("Invalid line length or quantity");
      }

      const item = await tx.woodItem.findUnique({ where: { id: line.woodItemId } });
      if (!item) throw new Error(`Wood item ${line.woodItemId} not found`);

      let remainingNeeded = line.quantity;

      const remainders = await tx.remainder.findMany({
        where: {
          woodItemId: line.woodItemId,
          lengthM: { gte: new Prisma.Decimal(pieceLength.toFixed(3)) },
          quantity: { gt: 0 },
        },
        orderBy: [{ lengthM: "asc" }, { createdAt: "asc" }],
      });

      for (const rem of remainders) {
        if (remainingNeeded === 0) break;
        const take = Math.min(rem.quantity, remainingNeeded);
        if (take <= 0) continue;

        await consumeRemainder(tx, rem.id, take);
        await tx.inventoryMovement.create({
          data: {
            woodItemId: line.woodItemId,
            movementType: MovementType.OUT,
            fromLength: rem.lengthM,
            toLength: null,
            quantity: take,
          },
        });

        const leftover = toDecimal(rem.lengthM).minus(pieceLength);
        if (leftover.gt(0)) {
          const rounded = new Prisma.Decimal(leftover.toFixed(3));
          const existing = await tx.remainder.findFirst({ where: { woodItemId: line.woodItemId, lengthM: rounded } });
          if (existing) {
            await tx.remainder.update({ where: { id: existing.id }, data: { quantity: { increment: take } } });
          } else {
            await tx.remainder.create({ data: { woodItemId: line.woodItemId, lengthM: rounded, quantity: take } });
          }
          await tx.inventoryMovement.create({
            data: {
              woodItemId: line.woodItemId,
              movementType: MovementType.TRANSFORM,
              fromLength: rem.lengthM,
              toLength: rounded,
              quantity: take,
            },
          });
        }

        remainingNeeded -= take;
      }

      if (remainingNeeded > 0) {
        const batches = await tx.stockBatch.findMany({
          where: {
            woodItemId: line.woodItemId,
            pieceLengthM: { gte: new Prisma.Decimal(pieceLength.toFixed(3)) },
            quantity: { gt: 0 },
          },
          orderBy: [{ createdAt: "asc" }, { pieceLengthM: "asc" }],
        });

        for (const batch of batches) {
          if (remainingNeeded === 0) break;
          const take = Math.min(batch.quantity, remainingNeeded);
          if (take <= 0) continue;

          await consumeBatch(tx, batch.id, take);
          await tx.inventoryMovement.create({
            data: {
              woodItemId: line.woodItemId,
              movementType: MovementType.OUT,
              fromLength: batch.pieceLengthM,
              toLength: null,
              quantity: take,
            },
          });

          const leftover = toDecimal(batch.pieceLengthM).minus(pieceLength);
          if (leftover.gt(0)) {
            const rounded = new Prisma.Decimal(leftover.toFixed(3));
            const existing = await tx.remainder.findFirst({ where: { woodItemId: line.woodItemId, lengthM: rounded } });
            if (existing) {
              await tx.remainder.update({ where: { id: existing.id }, data: { quantity: { increment: take } } });
            } else {
              await tx.remainder.create({ data: { woodItemId: line.woodItemId, lengthM: rounded, quantity: take } });
            }
            await tx.inventoryMovement.create({
              data: {
                woodItemId: line.woodItemId,
                movementType: MovementType.TRANSFORM,
                fromLength: batch.pieceLengthM,
                toLength: rounded,
                quantity: take,
              },
            });
          }

          remainingNeeded -= take;
        }
      }

      if (remainingNeeded > 0) {
        throw new Error(`Insufficient stock for wood item ${line.woodItemId}`);
      }

      const unitPrice = toDecimal(item.pricePerMeter);
      const lineTotal = unitPrice.mul(pieceLength).mul(line.quantity);
      saleTotal = saleTotal.plus(lineTotal);

      pendingLines.push({
        woodItemId: line.woodItemId,
        quantity: line.quantity,
        lengthSoldM: new Prisma.Decimal(pieceLength.toFixed(3)),
        pricePerMeter: item.pricePerMeter,
        lineTotal: new Prisma.Decimal(lineTotal.toFixed(2)),
      });
    }

    const sale = await tx.sale.create({
      data: {
        customerName: input.customerName,
        totalAmount: new Prisma.Decimal(saleTotal.toFixed(2)),
        saleLines: { create: pendingLines },
      },
      include: { saleLines: true },
    });

    return sale;
  });
}

export async function getDashboardMetrics() {
  const [woodTypes, stockBatches, remainders] = await Promise.all([
    prisma.woodItem.count(),
    prisma.stockBatch.findMany(),
    prisma.remainder.findMany(),
  ]);

  const totalPieces = stockBatches.reduce((acc, s) => acc + s.quantity, 0) + remainders.reduce((acc, r) => acc + r.quantity, 0);
  const lowStock = stockBatches.filter((s) => s.quantity <= 3).length;

  return { woodTypes, totalPieces, lowStock };
}
