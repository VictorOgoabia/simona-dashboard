// Shared, pure presentation constants (no React, no state).
// Extracted from the old localStorage store when the app moved to Supabase.

// The 7-stage order pipeline.
export const STAGES = [
  "Inquiry",
  "Confirmed",
  "In Production",
  "QC",
  "Ready",
  "Dispatched",
  "Delivered",
];

// The 3-stage production/QC strip.
export const QSTAGES = ["In Production", "QC", "Ready"];

// Pillar badge classes (planner / overview).
export const PCOLS: Record<string, string> = {
  Production: "bsd",
  "Content and Marketing": "bin",
  "Client Relations": "bok",
  Operations: "bnt",
  Finance: "bwn",
  People: "ber",
};

// Priority badge classes.
export const PRCOLS: Record<string, string> = {
  Normal: "bnt",
  High: "bwn",
  Urgent: "ber",
};

// Status -> badge class for an order status.
export function sb(s: string): string {
  return (
    (
      {
        Inquiry: "bnt",
        Confirmed: "bin",
        "In Production": "bwn",
        QC: "bsd",
        Ready: "bok",
        Dispatched: "bin",
        Delivered: "bok",
      } as Record<string, string>
    )[s] || "bnt"
  );
}
