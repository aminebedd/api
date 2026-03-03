import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/services/inventory";

export async function GET() {
  const metrics = await getDashboardMetrics();
  return NextResponse.json(metrics);
}
