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
  "QC/Fulfilment": "bok",
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

// --- Gender-specific measurement field sets -------------------------------

export type Gender = "Male" | "Female";

// [label, column key]
export const MAN_FIELDS: readonly [string, MeasurementKey][] = [
  ["Shoulder", "shoulder"],
  ["Sleeve Length", "sleeve_length"],
  ["Sleeve Width", "sleeve_width"],
  ["Chest", "chest"],
  ["Tummy", "tummy"],
  ["Waist", "waist"],
  ["Hip", "hip"],
  ["Thigh", "thigh"],
  ["Pants Length", "pants_length"],
  ["Calf", "calf"],
  ["Shirt Length", "shirt_length"],
];

export const WOMAN_FIELDS: readonly [string, MeasurementKey][] = [
  ["Bust", "bust"],
  ["Waist", "waist"],
  ["Hip", "hip"],
  ["Shoulder", "shoulder"],
  ["Sleeve Length", "sleeve_length"],
  ["Sleeve Width", "sleeve_width"],
  ["Pants Length", "pants_length"],
  ["Short Dress Length", "short_dress_length"],
  ["Long Dress Length", "long_dress_length"],
  ["Skirt Length", "skirt_length"],
];

// Every measurement column (union of both sets) — used to build form state.
export const MEASUREMENT_KEYS = [
  "shoulder",
  "sleeve_length",
  "sleeve_width",
  "chest",
  "tummy",
  "waist",
  "hip",
  "thigh",
  "pants_length",
  "calf",
  "shirt_length",
  "bust",
  "short_dress_length",
  "long_dress_length",
  "skirt_length",
] as const;

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

// Which field set to show. Defaults to the Woman set when gender is unset.
export function fieldsForGender(
  g: string | null | undefined
): readonly [string, MeasurementKey][] {
  return g === "Male" ? MAN_FIELDS : WOMAN_FIELDS;
}
