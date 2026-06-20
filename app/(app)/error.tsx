"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/report-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "app", digest: error.digest });
  }, [error]);

  return (
    <div className="panel active">
      <div className="empty" style={{ maxWidth: 440, margin: "48px auto" }}>
        <i className="ti ti-alert-triangle" />
        <p
          style={{
            fontWeight: 500,
            color: "var(--midnight)",
            marginBottom: 6,
            fontSize: 15,
          }}
        >
          Something went wrong
        </p>
        <p style={{ marginBottom: 16 }}>
          We couldn&rsquo;t load this page. Please try again.
        </p>
        <button className="btn bp" onClick={reset}>
          <i className="ti ti-refresh" /> Try again
        </button>
      </div>
    </div>
  );
}
