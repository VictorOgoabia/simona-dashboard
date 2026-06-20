"use client";

import { useState, useTransition } from "react";

import { advanceProduction, saveQcNote } from "@/app/(app)/production/actions";
import { useToast } from "@/components/ui-kit/toast";
import { QSTAGES, sb } from "@/lib/constants";

export interface ProdOrder {
  id: string;
  order_code: string | null;
  client_name: string | null;
  item: string | null;
  collection: string | null;
  due_date: string | null;
  status: string | null;
  qc_note: string | null;
}

const code = (o: ProdOrder) => o.order_code || o.id.slice(0, 8);

export function ProductionView({ orders }: { orders: ProdOrder[] }) {
  const ip = orders.filter((o) => o.status === "In Production");
  const iq = orders.filter((o) => o.status === "QC");

  if (!ip.length && !iq.length) {
    return (
      <div className="panel active">
        <div className="pgtitle">Production Queue</div>
        <div className="pgsub">Active production &amp; QC orders</div>
        <div className="empty">
          <i className="ti ti-shirt-off" />
          <p>No orders currently in production or QC</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel active">
      <div className="pgtitle">Production Queue</div>
      <div className="pgsub">Active production &amp; QC orders</div>

      {ip.length ? <Group list={ip} label="In Production" badge="bwn" /> : null}
      {ip.length && iq.length ? <hr className="hdiv" /> : null}
      {iq.length ? (
        <Group list={iq} label="QC - Awaiting Approval" badge="bsd" />
      ) : null}
    </div>
  );
}

function Group({
  list,
  label,
  badge,
}: {
  list: ProdOrder[];
  label: string;
  badge: string;
}) {
  return (
    <div>
      <div className="qglbl">
        {label} <span className={"bdg " + badge}>{list.length}</span>
      </div>
      {list.map((o) => (
        <ProdCard key={o.id} order={o} />
      ))}
    </div>
  );
}

function ProdCard({ order: o }: { order: ProdOrder }) {
  const toast = useToast();
  const [note, setNote] = useState(o.qc_note || "");
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();
  const si = QSTAGES.indexOf(o.status ?? "");

  function doSave() {
    startTransition(async () => {
      try {
        await saveQcNote(o.id, note);
        setSaved(true);
        setTimeout(() => setSaved(false), 1400);
      } catch {
        toast({ title: "Could not save QC note", variant: "error" });
      }
    });
  }

  function doAdvance(status: string) {
    startTransition(async () => {
      try {
        await advanceProduction(o.id, status, note);
        toast({ title: "Order moved to " + status, variant: "success" });
      } catch {
        toast({ title: "Could not advance order", variant: "error" });
      }
    });
  }

  return (
    <div className="qcard">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 9,
          gap: 11,
        }}
      >
        <div>
          <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 3 }}>
            {o.client_name}
          </div>
          <div style={{ fontSize: 12, color: "var(--nt)" }}>{o.item}</div>
          <div style={{ fontSize: 11, color: "var(--nt)", marginTop: 3 }}>
            {o.collection} &middot; Due:{" "}
            <strong style={{ color: "var(--midnight)" }}>
              {o.due_date || "-"}
            </strong>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span className={"bdg " + sb(o.status || "")}>{o.status}</span>
          <span style={{ fontSize: 10, color: "var(--nt)" }}>{code(o)}</span>
        </div>
      </div>

      <div className="stgs" style={{ marginBottom: 11 }}>
        {QSTAGES.map((s, i) => (
          <span key={s} style={{ display: "contents" }}>
            <span className={"stg " + (i < si ? "dn" : i === si ? "cur" : "")}>
              {s}
            </span>
            {i < QSTAGES.length - 1 ? (
              <span className="sarr" style={{ padding: "0 2px" }}>
                ›
              </span>
            ) : null}
          </span>
        ))}
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--nt)",
          marginBottom: 5,
        }}
      >
        QC Notes
      </div>
      <textarea
        className={"qnote" + (saved ? " flash" : "")}
        placeholder="Add quality control notes..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
        <button className="btn bg sm" onClick={doSave}>
          <i className="ti ti-device-floppy" /> {saved ? "Saved" : "Save Note"}
        </button>
        {o.status === "In Production" ? (
          <button className="btn bw sm" onClick={() => doAdvance("QC")}>
            <i className="ti ti-arrow-right" /> Move to QC
          </button>
        ) : null}
        {o.status === "QC" ? (
          <button className="btn bs sm" onClick={() => doAdvance("Ready")}>
            <i className="ti ti-check" /> Mark Ready
          </button>
        ) : null}
      </div>
    </div>
  );
}
