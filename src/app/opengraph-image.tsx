import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default social card. Text + CSS shapes only (no remote fonts) so it renders
// deterministically at build time and applies to every route lacking its own image.
export default function OpenGraphImage() {
  const bars = [38, 62, 50, 78, 96];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
            {bars.map((h, i) => (
              <div
                key={i}
                style={{ width: 16, height: `${h}%`, background: "#f7941e", borderRadius: 3 }}
              />
            ))}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#1a1a1a", marginLeft: 8 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 800,
              color: "#1a1a1a",
              lineHeight: 1.1,
            }}
          >
            <div style={{ display: "flex" }}>Indian Mutual Funds</div>
            <div style={{ display: "flex" }}>Ranked by CAGR</div>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#6b6b6b", marginTop: 24, maxWidth: 900 }}>
            NAV history and 1, 3, 5 &amp; 10-year CAGR for 4,500+ direct-plan schemes — updated
            daily.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ height: 8, width: 120, background: "#f7941e", borderRadius: 4 }} />
          <div style={{ fontSize: 24, color: "#9a9a9a" }}>mutualfundsbycagr.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
