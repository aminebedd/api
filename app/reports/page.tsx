"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<any>({ stock: [], sales: [], remainders: [] });

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then(setData);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dailySales = data.sales.filter((s: any) => s.createdAt?.slice(0, 10) === today).length;

  return (
    <main className="space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Current Stock Rows</p><p className="text-2xl font-bold">{data.stock.length}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Sales Today</p><p className="text-2xl font-bold">{dailySales}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Remainder Rows</p><p className="text-2xl font-bold">{data.remainders.length}</p></div>
      </section>
      <section className="card flex gap-3">
        <a className="btn" href="/api/reports/excel">Export to Excel</a>
        <a className="btn" href="/api/reports/pdf">Export to PDF</a>
      </section>
    </main>
  );
}
