import type { Metadata } from "next";
import "../index.css"; // Assumes tailwind standard styles exist in parent tree

export const metadata: Metadata = {
  title: "Momentum AI - Your Autonomous Chief of Staff",
  description: "An agentic AI engine that proactively executes objectives and completes tasks before you even ask.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-neutral-100 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
