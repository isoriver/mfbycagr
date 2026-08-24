import { NextResponse } from "next/server";
import { getAllFunds } from "@/lib/dataset";

// Reads a query param, so this handler is dynamic. The dataset it reads is static
// and cached in-process, so responses are effectively instant.
export const dynamic = "force-dynamic";

/** Typeahead search over the summary dataset (name / house / category / code). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const funds = getAllFunds();
  const results = funds
    .filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.house.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        String(f.code).includes(q),
    )
    .slice(0, 12)
    .map((f) => ({ code: f.code, name: f.name, house: f.house }));

  return NextResponse.json({ results });
}
