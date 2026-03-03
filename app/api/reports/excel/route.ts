import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({ include: { saleLines: { include: { woodItem: true } } } });
  const rows = sales.flatMap((sale) =>
    sale.saleLines.map((line) => ({
      saleId: sale.id,
      customer: sale.customerName ?? "Walk-in",
      date: sale.createdAt.toISOString(),
      woodType: line.woodItem.type,
      quantity: line.quantity,
      lengthM: Number(line.lengthSoldM),
      lineTotal: Number(line.lineTotal),
    })),
  );

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sales");
  const file = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sales-report.xlsx"',
    },
  });
}
