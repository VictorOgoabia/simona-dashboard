"use client";

import { cloneElement, isValidElement, useId } from "react";

/**
 * Labelled form field. Generates an id and wires the <label htmlFor> to the
 * input (cloned to receive the id) for proper accessibility.
 */
export function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  const child = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
    : children;

  return (
    <div className={"fg" + (full ? " full" : "")}>
      <label className="flbl" htmlFor={id}>
        {label}
      </label>
      {child}
    </div>
  );
}
