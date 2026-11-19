"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6ee",
          color: "#121916",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#175340" }}>
          Manuella Sole Footwear
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 400, margin: "16px 0 8px" }}>Something went wrong</h1>
        <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.7, color: "#5f6b62" }}>
          An unexpected error occurred. Please try again — if the problem persists, contact us on
          WhatsApp.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 28,
            height: 48,
            padding: "0 28px",
            background: "#121916",
            color: "#faf6ee",
            border: "none",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
