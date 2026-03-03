import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Wood Store Desktop",
  description: "Wood stock and sales manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Wood Store Desktop</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/">Dashboard</Link>
              <Link href="/stock">Stock</Link>
              <Link href="/sell">Sell</Link>
              <Link href="/reports">Reports</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
