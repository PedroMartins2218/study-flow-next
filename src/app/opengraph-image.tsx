import { ImageResponse } from "next/og";

export const alt = "Study Flow — organize seus estudos e transforme foco em resultado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem de preview (Open Graph) mostrada quando o link é compartilhado no
// WhatsApp, Instagram, etc. Gerada dinamicamente — sem arquivo estático.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1220",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              marginRight: 22,
            }}
          >
            ST
          </div>
          <div style={{ fontSize: 38, fontWeight: 700 }}>Study Flow</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
            Organize seus estudos e transforme foco em resultado.
          </div>
          <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 24, maxWidth: 940 }}>
            Matérias, atividades, provas, caderno e modo foco — num só painel.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#1e293b",
              color: "#60a5fa",
              fontSize: 26,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 999,
            }}
          >
            Acesso de fundador · pré-lançamento
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
