"use client";

import { useState, useTransition } from "react";

import { toggleTaskDone } from "@/app/(app)/overview/actions";
import { useShell } from "@/components/simona/shell-context";
import { PCOLS } from "@/lib/constants";

// Row shapes as returned from Supabase (orders come from the orders_safe view).
export interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  location: string | null;
  tag: string | null;
  created_at: string;
}
export interface OrderRow {
  id: string;
  status: string | null;
  amount: number | null;
  payment_status: string | null;
}
export interface TaskRow {
  id: string;
  task: string;
  due_date: string | null;
  pillar: string | null;
  done: boolean;
}

const STAGES = [
  "Inquiry",
  "Confirmed",
  "In Production",
  "QC",
  "Ready",
  "Dispatched",
  "Delivered",
];

function Mc({ l, v, s }: { l: string; v: React.ReactNode; s: string }) {
  return (
    <div className="mc">
      <div className="mclbl">{l}</div>
      <div className="mcval">{v}</div>
      <div className="mcsub">{s}</div>
    </div>
  );
}

export function OverviewView({
  clients,
  orders,
  tasks: initialTasks,
}: {
  clients: ClientRow[];
  orders: OrderRow[];
  tasks: TaskRow[];
}) {
  const { goTo } = useShell();
  const [tasks, setTasks] = useState(initialTasks);
  const [, startTransition] = useTransition();

  const del = orders.filter((o) => o.status === "Delivered").length;
  const act = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Inquiry"
  ).length;
  const rev = orders
    .filter((o) => o.payment_status === "Paid in Full")
    .reduce((a, o) => a + (o.amount ?? 0), 0);
  const pend = orders.filter(
    (o) => o.status === "Ready" || o.status === "Dispatched"
  ).length;

  const sc: Record<string, number> = {};
  STAGES.forEach((s) => {
    sc[s] = orders.filter((o) => o.status === s).length;
  });

  // 3 most recently added clients (query is ordered by created_at ascending).
  const rc = clients.slice(-3).reverse();

  const today = new Date();
  const wt = tasks
    .filter((t) => {
      if (!t.due_date) return false;
      const df = (new Date(t.due_date).getTime() - today.getTime()) / 864e5;
      return df >= -1 && df <= 7;
    })
    .slice(0, 5);

  function onToggle(id: string, done: boolean) {
    // Optimistic update; revert if the write fails.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    startTransition(async () => {
      try {
        await toggleTaskDone(id, done);
      } catch {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, done: !done } : t))
        );
      }
    });
  }

  return (
    <div className="panel active">
      <div className="pgtitle">Brand Overview</div>
      <div className="pgsub">June 2026 &middot; Lagos, Nigeria</div>

      <div className="mrow">
        <Mc l="Total Clients" v={clients.length} s="All time" />
        <Mc l="Active Orders" v={act} s="In pipeline" />
        <Mc
          l="Revenue (Paid)"
          v={"N" + Math.round(rev / 1000) + "k"}
          s="June 2026"
        />
        <Mc l="Awaiting Dispatch" v={pend} s="Ready or dispatched" />
        <Mc l="Total Orders" v={orders.length} s="All time" />
      </div>

      <div className="twocol">
        <div className="card">
          <div className="cardhd">
            <span className="cardttl">Order Pipeline</span>
            <button className="btn bg sm" onClick={() => goTo("orders")}>
              View all
            </button>
          </div>
          <div>
            {STAGES.map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(26,26,26,0.05)",
                }}
              >
                <span style={{ fontSize: 12 }}>{s}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: sc[s] > 0 ? "var(--midnight)" : "var(--nt)",
                  }}
                >
                  {sc[s]}
                </span>
              </div>
            ))}
            <div className="pbar mt8">
              <div
                className="pfill"
                style={{
                  width:
                    Math.round((del / Math.max(orders.length, 1)) * 100) + "%",
                }}
              />
            </div>
            <div className="muted mt8">
              {del} of {orders.length} delivered
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardhd">
            <span className="cardttl">Recent Clients</span>
            <button className="btn bg sm" onClick={() => goTo("clients")}>
              View all
            </button>
          </div>
          <div>
            {rc.length ? (
              rc.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(26,26,26,0.05)",
                  }}
                >
                  <div
                    className="av"
                    style={{ width: 36, height: 36, fontSize: 12 }}
                  >
                    {c.first_name[0]}
                    {c.last_name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="muted">
                      {c.location}{" "}
                      {c.tag ? (
                        <span className="bdg bsd" style={{ fontSize: 9 }}>
                          {c.tag}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                <p>No clients yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardhd">
          <span className="cardttl">This Week&rsquo;s Tasks</span>
          <button className="btn bg sm" onClick={() => goTo("planner")}>
            Full planner
          </button>
        </div>
        <div>
          {wt.length ? (
            wt.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(26,26,26,0.05)",
                }}
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => onToggle(t.id, e.target.checked)}
                  style={{
                    accentColor: "var(--sand)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    flex: 1,
                    textDecoration: t.done ? "line-through" : undefined,
                    color: t.done ? "var(--nt)" : undefined,
                  }}
                >
                  {t.task}
                </span>
                {t.pillar ? (
                  <span
                    className={"bdg " + (PCOLS[t.pillar] || "bnt")}
                    style={{ flexShrink: 0 }}
                  >
                    {t.pillar}
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <div className="empty" style={{ padding: 16 }}>
              <p>No tasks this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
