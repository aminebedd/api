import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  const doc = new PDFDocument({ margin: 30 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).text("Wood Sales Report", { underline: true });
  doc.moveDown();

  sales.forEach((sale) => {
    doc.fontSize(11).text(
      `#${sale.id} | ${sale.customerName ?? "Walk-in"} | ${sale.createdAt.toISOString().slice(0, 10)} | Total: $${Number(sale.totalAmount).toFixed(2)}`,
    );
  });

  doc.end();

  await new Promise<void>((resolve) => doc.on("end", () => resolve()));
  const file = Buffer.concat(chunks);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="sales-report.pdf"',
    },
  });
}
