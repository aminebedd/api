"use client";

import { useEffect, useState } from "react";

type WoodItem = { id: number; type: string; thickness: number; width: number; pricePerMeter: number };

export default function StockPage() {
  const [items, setItems] = useState<WoodItem[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [form, setForm] = useState({ type: "", thickness: "", width: "", pricePerMeter: "" });
  const [batch, setBatch] = useState({ woodItemId: "", pieceLengthM: "", quantity: "" });

  async function load() {
    const [itemsRes, stockRes] = await Promise.all([fetch("/api/wood-items"), fetch("/api/stock")]);
    setItems(await itemsRes.json());
    setStock(await stockRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-semibold">Add Wood Type</h2>
          {Object.keys(form).map((k) => (
            <input key={k} className="input" placeholder={k} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <button
            className="btn"
            onClick={async () => {
              await fetch("/api/wood-items", { method: "POST", body: JSON.stringify(form) });
              setForm({ type: "", thickness: "", width: "", pricePerMeter: "" });
              await load();
            }}
          >
            Save Wood Type
          </button>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold">Add Stock Batch</h2>
          <select className="input" value={batch.woodItemId} onChange={(e) => setBatch({ ...batch, woodItemId: e.target.value })}>
            <option value="">Select wood type</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{`${item.type} (${item.thickness}x${item.width})`}</option>
            ))}
          </select>
          <input className="input" placeholder="pieceLengthM" value={batch.pieceLengthM} onChange={(e) => setBatch({ ...batch, pieceLengthM: e.target.value })} />
          <input className="input" placeholder="quantity" value={batch.quantity} onChange={(e) => setBatch({ ...batch, quantity: e.target.value })} />
          <button
            className="btn"
            onClick={async () => {
              await fetch("/api/stock", { method: "POST", body: JSON.stringify({ ...batch, woodItemId: Number(batch.woodItemId), quantity: Number(batch.quantity) }) });
              setBatch({ woodItemId: "", pieceLengthM: "", quantity: "" });
              await load();
            }}
          >
            Save Batch
          </button>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Current Stock</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th>Wood Type</th><th>Dimensions</th><th>Length (m)</th><th>Quantity</th><th>Price/m</th><th>Total Value</th><th>Source</th>
            </tr>
          </thead>
          <tbody>
            {stock.flatMap((s) =>
              s.rows.map((r: any, idx: number) => (
                <tr key={`${s.item.id}-${idx}`} className="border-t">
                  <td>{s.item.type}</td>
                  <td>{`${s.item.thickness} x ${s.item.width}`}</td>
                  <td>{r.length}</td>
                  <td>{r.quantity}</td>
                  <td>{Number(s.item.pricePerMeter).toFixed(2)}</td>
                  <td>{r.value.toFixed(2)}</td>
                  <td>{r.source}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
