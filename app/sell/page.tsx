"use client";

import { useEffect, useMemo, useState } from "react";

type WoodItem = { id: number; type: string; thickness: number; width: number; pricePerMeter: number };

export default function SellPage() {
  const [items, setItems] = useState<WoodItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [line, setLine] = useState({ woodItemId: "", lengthSoldM: "", quantity: "" });
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    fetch("/api/wood-items").then((r) => r.json()).then(setItems);
  }, []);

  const price = useMemo(() => items.find((x) => x.id === Number(line.woodItemId))?.pricePerMeter ?? 0, [items, line.woodItemId]);
  const lineTotal = useMemo(() => Number(line.quantity || 0) * Number(line.lengthSoldM || 0) * Number(price), [line, price]);

  return (
    <main className="card max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">Sell Wood (POS)</h2>
      <input className="input" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      <select className="input" value={line.woodItemId} onChange={(e) => setLine({ ...line, woodItemId: e.target.value })}>
        <option value="">Select wood type</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{`${item.type} (${item.thickness}x${item.width})`}</option>
        ))}
      </select>
      <input className="input" placeholder="Length to sell (m, decimals allowed)" value={line.lengthSoldM} onChange={(e) => setLine({ ...line, lengthSoldM: e.target.value })} />
      <input className="input" placeholder="Quantity" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: e.target.value })} />

      <div className="rounded bg-slate-100 p-3 text-sm">
        Price per meter: <b>{Number(price).toFixed(2)}</b> | Line total: <b>{lineTotal.toFixed(2)}</b>
      </div>

      <button
        className="btn"
        onClick={async () => {
          const payload = { customerName: customerName || undefined, lines: [{ woodItemId: Number(line.woodItemId), lengthSoldM: line.lengthSoldM, quantity: Number(line.quantity) }] };
          const res = await fetch("/api/sales", { method: "POST", body: JSON.stringify(payload) });
          const json = await res.json();
          if (!res.ok) return setResult(json.error ?? "Failed to process sale");
          setResult(`Sale #${json.id} created. Total ${json.totalAmount}`);
          window.print();
        }}
      >
        Confirm Sale & Print Invoice
      </button>

      {result && <p className="text-sm text-emerald-700">{result}</p>}
    </main>
  );
}
