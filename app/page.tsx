async function getMetrics() {
  const res = await fetch("http://localhost:3000/api/dashboard", { cache: "no-store" });
  if (!res.ok) return { woodTypes: 0, totalPieces: 0, lowStock: 0 };
  return res.json();
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return (
    <main className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <section className="card">
        <h2 className="text-sm text-slate-500">Wood Types</h2>
        <p className="text-3xl font-bold">{metrics.woodTypes}</p>
      </section>
      <section className="card">
        <h2 className="text-sm text-slate-500">Total Stock Pieces</h2>
        <p className="text-3xl font-bold">{metrics.totalPieces}</p>
      </section>
      <section className="card">
        <h2 className="text-sm text-slate-500">Low Stock Alerts</h2>
        <p className="text-3xl font-bold text-amber-600">{metrics.lowStock}</p>
      </section>
    </main>
  );
}
