"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/report-error";

// Replaces the root layout when an error happens above the route segments, so
// it must render its own <html>/<body> and can't rely on globals.css.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "global", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A1A",
          color: "#F5F2ED",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 380 }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 34,
              color: "#C4A882",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            SIMONA
          </div>
          <p style={{ fontSize: 15, marginBottom: 6 }}>Something went wrong</p>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 20 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#C4A882",
              color: "#1A1A1A",
              border: "none",
              borderRadius: 7,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
