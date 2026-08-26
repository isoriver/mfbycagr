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
  const matches = funds.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.house.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      String(f.code).includes(q),
  );

  // Rank name-start matches first so "hdfc" surfaces HDFC funds ahead of incidental hits.
  matches.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });

  const results = matches.slice(0, 8).map((f) => ({
    code: f.code,
    name: f.name,
    house: f.house,
    category: f.category,
    type: f.type,
    y5: f.y5,
  }));

  return NextResponse.json({ results, total: matches.length });
}
