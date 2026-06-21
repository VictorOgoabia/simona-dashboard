"use client";

import { useState, useTransition } from "react";

import {
  createOrder,
  deleteOrder,
  saveOrderOpsNote,
  updateOrderStatus,
  type NewOrderInput,
} from "@/app/(app)/orders/actions";
import { useShell } from "@/components/simona/shell-context";
import { Field } from "@/components/ui-kit/field";
import { Modal } from "@/components/ui-kit/modal";
import { useConfirm } from "@/components/ui-kit/confirm";
import { useToast } from "@/components/ui-kit/toast";
import {
  fieldsForGender,
  STAGES,
  sb,
  type MeasurementKey,
} from "@/lib/constants";
import type { AppRole } from "@/lib/supabase/auth";

export interface MeasurementFields {
  gender: string | null;
  shoulder: string | null;
  sleeve_length: string | null;
  sleeve_width: string | null;
  chest: string | null;
  tummy: string | null;
  waist: string | null;
  hip: string | null;
  thigh: string | null;
  pants_length: string | null;
  calf: string | null;
  shirt_length: string | null;
  bust: string | null;
  short_dress_length: string | null;
  long_dress_length: string | null;
  skirt_length: string | null;
}

export interface OrderRow extends MeasurementFields {
  id: string;
  order_code: string | null;
  client_id: string | null;
  client_name: string | null;
  order_type: string | null;
  item: string | null;
  collection: string | null;
  amount: number | null;
  payment_status: string | null;
  order_date: string | null;
  due_date: string | null;
  status: string | null;
  assigned_to: string | null;
  notes: string | null;
  qc_note: string | null;
  ops_note: string | null;
}

export interface OrderClientRow extends MeasurementFields {
  id: string;
  first_name: string;
  last_name: string;
  uk_size: string | null;
  height_cm: string | null;
  fit_notes: string | null;
}

const code = (o: OrderRow) => o.order_code || o.id.slice(0, 8);

function payClass(py: string | null) {
  return py === "Paid in Full" ? "bok" : py === "50% Deposit" ? "bwn" : "ber";
}

export function OrdersView({
  orders,
  clients,
  role,
}: {
  orders: OrderRow[];
  clients: OrderClientRow[];
  role: AppRole;
}) {
  const [tab, setTab] = useState<"list" | "kanban">("list");
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const isAdmin = role === "admin";

  const ql = q.toLowerCase();
  const list = orders.filter(
    (o) =>
      `${code(o)} ${o.client_name ?? ""} ${o.item ?? ""}`
        .toLowerCase()
        .indexOf(ql) >= 0 && (f ? o.status === f : true)
  );

  const sel = selId ? orders.find((o) => o.id === selId) : null;

  return (
    <div className="panel active">
      <div className="fbetween" style={{ marginBottom: 4 }}>
        <div className="pgtitle">Order Tracker</div>
        <div>
          <button className="btn bp" onClick={() => setShowNew(true)}>
            <i className="ti ti-plus" /> New Order
          </button>
        </div>
      </div>
      <div className="pgsub">Track every order from inquiry to delivery</div>

      <div className="itabs">
        <button
          className={"itab" + (tab === "list" ? " active" : "")}
          onClick={() => setTab("list")}
        >
          All Orders
        </button>
        <button
          className={"itab" + (tab === "kanban" ? " active" : "")}
          onClick={() => setTab("kanban")}
        >
          Pipeline View
        </button>
      </div>

      <div className="sbar">
        <input
          className="fi"
          placeholder="Search by order ID, client or item…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="fi"
          style={{ width: 165 }}
          value={f}
          onChange={(e) => setF(e.target.value)}
        >
          <option value="">All statuses</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {tab === "list" ? (
        !list.length ? (
          <div className="empty">
            <i className="ti ti-package-off" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="twrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Item</th>
                    <th>Type</th>
                    {isAdmin ? (
                      <>
                        <th>Amount</th>
                        <th>Payment</th>
                      </>
                    ) : null}
                    <th>Due</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id} onClick={() => setSelId(o.id)}>
                      <td style={{ fontSize: 11, color: "var(--nt)" }}>
                        {code(o)}
                      </td>
                      <td style={{ fontWeight: 500 }}>{o.client_name}</td>
                      <td>{o.item}</td>
                      <td>
                        <span className="bdg bnt" style={{ fontSize: 9 }}>
                          {(o.order_type || "").split("(")[0].trim()}
                        </span>
                      </td>
                      {isAdmin ? (
                        <>
                          <td>
                            {o.amount != null
                              ? "N" + Number(o.amount).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={"bdg " + payClass(o.payment_status)}
                              style={{ fontSize: 9 }}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                        </>
                      ) : null}
                      <td style={{ fontSize: 12, color: "var(--nt)" }}>
                        {o.due_date || "-"}
                      </td>
                      <td>
                        <span className={"bdg " + sb(o.status || "")}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn bg sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelId(o.id);
                          }}
                        >
                          <i className="ti ti-eye" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="kgrid">
          {STAGES.map((s) => {
            const ords = orders.filter((o) => o.status === s);
            return (
              <div className="kcol" key={s}>
                <div className="kcolttl">
                  {s}
                  <span
                    style={{
                      background: "var(--sand)",
                      color: "var(--ton)",
                      padding: "2px 7px",
                      borderRadius: 10,
                      fontSize: 9,
                    }}
                  >
                    {ords.length}
                  </span>
                </div>
                {ords.length ? (
                  ords.map((o) => (
                    <div
                      className="kcard"
                      key={o.id}
                      onClick={() => setSelId(o.id)}
                    >
                      <div className="kcardn">{o.client_name}</div>
                      <div className="kcardm">
                        {(o.item || "").substring(0, 26)}
                        {(o.item || "").length > 26 ? "..." : ""}
                      </div>
                      {isAdmin && o.amount != null ? (
                        <div className="kcardm" style={{ marginTop: 4 }}>
                          N{Number(o.amount).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--nt)",
                      textAlign: "center",
                      padding: "10px 0",
                    }}
                  >
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sel ? (
        <OrderDetail
          o={sel}
          isAdmin={isAdmin}
          onClose={() => setSelId(null)}
        />
      ) : null}

      {showNew ? (
        <NewOrderModal clients={clients} onClose={() => setShowNew(false)} />
      ) : null}
    </div>
  );
}

// --- Detail modal ----------------------------------------------------------

function OrderDetail({
  o,
  isAdmin,
  onClose,
}: {
  o: OrderRow;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [stSel, setStSel] = useState(o.status ?? "Inquiry");
  const [opsNote, setOpsNote] = useState(o.ops_note ?? "");
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  const si = STAGES.indexOf(o.status ?? "");

  function doUpdateStatus() {
    startTransition(async () => {
      try {
        await updateOrderStatus(o.id, stSel);
        toast({ title: "Status updated", variant: "success" });
        onClose();
      } catch {
        toast({ title: "Could not update status", variant: "error" });
      }
    });
  }

  function doSaveNote() {
    startTransition(async () => {
      try {
        await saveOrderOpsNote(o.id, opsNote);
        setSaved(true);
        setTimeout(() => setSaved(false), 1400);
      } catch {
        toast({ title: "Could not save note", variant: "error" });
      }
    });
  }

  async function doDelete() {
    const ok = await confirm({
      title: "Delete order?",
      message: `This permanently removes order ${code(o)}.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteOrder(o.id);
        toast({ title: "Order deleted", variant: "success" });
        onClose();
      } catch {
        toast({ title: "Could not delete order", variant: "error" });
      }
    });
  }

  return (
    <Modal
      title={`${code(o)} — ${o.client_name}`}
      onClose={onClose}
      footer={
        <button className="btn bg" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="stgs" style={{ marginBottom: 15 }}>
            {STAGES.map((s, i) => (
              <span key={s} style={{ display: "contents" }}>
                <span
                  className={"stg " + (i < si ? "dn" : i === si ? "cur" : "")}
                >
                  {s}
                </span>
                {i < STAGES.length - 1 ? (
                  <span className="sarr" style={{ padding: "0 2px" }}>
                    ›
                  </span>
                ) : null}
              </span>
            ))}
          </div>

          <div className="igrid" style={{ marginBottom: 13 }}>
            <div className="irow">
              <span className="ikey">Type</span>
              <span className="ival">{o.order_type}</span>
            </div>
            <div className="irow">
              <span className="ikey">Collection</span>
              <span className="ival">{o.collection}</span>
            </div>
            <div className="irow" style={{ gridColumn: "1/-1" }}>
              <span className="ikey">Item</span>
              <span className="ival" style={{ fontWeight: 500 }}>
                {o.item}
              </span>
            </div>
            {isAdmin ? (
              <>
                <div className="irow">
                  <span className="ikey">Amount</span>
                  <span className="ival">
                    {o.amount != null
                      ? "N" + Number(o.amount).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="irow">
                  <span className="ikey">Payment</span>
                  <span className="ival">
                    <span className={"bdg " + payClass(o.payment_status)}>
                      {o.payment_status}
                    </span>
                  </span>
                </div>
              </>
            ) : null}
            <div className="irow">
              <span className="ikey">Order Date</span>
              <span className="ival">{o.order_date || "-"}</span>
            </div>
            <div className="irow">
              <span className="ikey">Due Date</span>
              <span className="ival">{o.due_date || "-"}</span>
            </div>
            <div className="irow">
              <span className="ikey">Assigned To</span>
              <span className="ival">{o.assigned_to || "-"}</span>
            </div>
            <div className="irow" style={{ gridColumn: "1/-1" }}>
              <span className="ikey">Order Notes</span>
              <span className="ival">{o.notes || "-"}</span>
            </div>
            {o.qc_note ? (
              <div className="irow" style={{ gridColumn: "1/-1" }}>
                <span className="ikey">QC Note</span>
                <span className="ival">{o.qc_note}</span>
              </div>
            ) : null}
          </div>

          <div style={{ marginBottom: 13 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--nt)",
                marginBottom: 6,
              }}
            >
              Update Status
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                className="fi"
                style={{ flex: 1, minWidth: 145 }}
                value={stSel}
                onChange={(e) => setStSel(e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button className="btn bg" onClick={doUpdateStatus}>
                Update
              </button>
              {isAdmin ? (
                <button className="btn bd sm" onClick={doDelete}>
                  <i className="ti ti-trash" />
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--nt)",
                marginBottom: 5,
              }}
            >
              Operations Note
            </div>
            <textarea
              className={"onote" + (saved ? " flash" : "")}
              placeholder="Add an operations note for this order..."
              value={opsNote}
              onChange={(e) => setOpsNote(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <button className="btn bg sm" onClick={doSaveNote}>
                <i className="ti ti-device-floppy" />{" "}
                {saved ? "Saved" : "Save Note"}
              </button>
            </div>
          </div>

          <MeasurementsBlock
            heading="Order Measurements"
            gender={o.gender}
            values={o}
          />
    </Modal>
  );
}

function MeasurementsBlock({
  heading,
  gender,
  values,
}: {
  heading: string;
  gender: string | null;
  values: Record<MeasurementKey, string | null>;
}) {
  const fields = fieldsForGender(gender);
  const hm = fields.some(([, key]) => values[key]);
  return (
    <div
      style={{
        marginTop: 14,
        padding: "14px 16px",
        background: "var(--linen)",
        borderRadius: 10,
        border: "1px solid rgba(196,168,130,0.3)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          color: "var(--sand-dk)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <i className="ti ti-ruler" style={{ fontSize: 13 }} /> {heading}
      </div>
      <div style={{ fontSize: 11, color: "var(--nt)", marginBottom: 8 }}>
        Gender:{" "}
        <strong style={{ color: "var(--midnight)" }}>
          {gender || "Not set"}
        </strong>
        {gender ? (
          <> &middot; SIMONA {gender === "Male" ? "Man" : "Woman"}</>
        ) : null}
      </div>
      {hm ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 6,
          }}
        >
          {fields.map(([label, key]) => (
            <div
              key={key}
              style={{
                background: "white",
                borderRadius: 6,
                padding: "7px 9px",
                border: "1px solid rgba(196,168,130,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--nt)",
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--midnight)",
                }}
              >
                {values[key] ? `${values[key]} in` : "—"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 12, color: "var(--nt)" }}>
          No measurements recorded for this order.
        </span>
      )}
    </div>
  );
}

// --- New order modal -------------------------------------------------------

const ORDER_INIT = {
  order_type: "MTM (Made-to-Measure)",
  client_id: "",
  item: "",
  collection: "Soleil Collection",
  amount: "",
  payment_status: "Unpaid",
  order_date: "",
  due_date: "",
  status: "Inquiry",
  assigned_to: "Director",
  notes: "",
  // per-order gender + measurements (prefilled from the client, editable)
  gender: "Female",
  shoulder: "",
  sleeve_length: "",
  sleeve_width: "",
  chest: "",
  tummy: "",
  waist: "",
  hip: "",
  thigh: "",
  pants_length: "",
  calf: "",
  shirt_length: "",
  bust: "",
  short_dress_length: "",
  long_dress_length: "",
  skirt_length: "",
};

function NewOrderModal({
  clients,
  onClose,
}: {
  clients: OrderClientRow[];
  onClose: () => void;
}) {
  const toast = useToast();
  const { goTo } = useShell();
  const [v, setV] = useState(ORDER_INIT);
  const [pending, startTransition] = useTransition();
  const set =
    (k: keyof typeof ORDER_INIT) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  // Selecting a client prefills gender + measurements (still editable).
  function onClientChange(id: string) {
    const c = clients.find((x) => x.id === id);
    setV((p) => ({
      ...p,
      client_id: id,
      gender: c?.gender || p.gender,
      shoulder: c?.shoulder ?? "",
      sleeve_length: c?.sleeve_length ?? "",
      sleeve_width: c?.sleeve_width ?? "",
      chest: c?.chest ?? "",
      tummy: c?.tummy ?? "",
      waist: c?.waist ?? "",
      hip: c?.hip ?? "",
      thigh: c?.thigh ?? "",
      pants_length: c?.pants_length ?? "",
      calf: c?.calf ?? "",
      shirt_length: c?.shirt_length ?? "",
      bust: c?.bust ?? "",
      short_dress_length: c?.short_dress_length ?? "",
      long_dress_length: c?.long_dress_length ?? "",
      skirt_length: c?.skirt_length ?? "",
    }));
  }

  function save() {
    const client = clients.find((c) => c.id === v.client_id);
    if (!client || !v.item.trim() || !v.amount) {
      toast({
        title: "Select a client, and enter an item and amount.",
        variant: "error",
      });
      return;
    }
    const input: NewOrderInput = {
      client_id: client.id,
      client_name: `${client.first_name} ${client.last_name}`,
      order_type: v.order_type,
      item: v.item.trim(),
      collection: v.collection,
      amount: Number(v.amount),
      payment_status: v.payment_status,
      order_date: v.order_date || null,
      due_date: v.due_date || null,
      status: v.status,
      assigned_to: v.assigned_to,
      notes: v.notes.trim(),
      gender: v.gender,
      shoulder: v.shoulder,
      sleeve_length: v.sleeve_length,
      sleeve_width: v.sleeve_width,
      chest: v.chest,
      tummy: v.tummy,
      waist: v.waist,
      hip: v.hip,
      thigh: v.thigh,
      pants_length: v.pants_length,
      calf: v.calf,
      shirt_length: v.shirt_length,
      bust: v.bust,
      short_dress_length: v.short_dress_length,
      long_dress_length: v.long_dress_length,
      skirt_length: v.skirt_length,
    };
    startTransition(async () => {
      try {
        await createOrder(input);
        toast({ title: "Order created", variant: "success" });
        onClose();
      } catch {
        toast({ title: "Could not create order", variant: "error" });
      }
    });
  }

  return (
    <Modal
      title="New Order"
      onClose={onClose}
      footer={
        <>
          <button className="btn bg" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button className="btn bp" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save Order"}
          </button>
        </>
      }
    >
      <div className="fg2">
            <Field label="Order Type">
              <select className="fi" value={v.order_type} onChange={set("order_type")}>
                <option>MTM (Made-to-Measure)</option>
                <option>Pre-Order</option>
                <option>Ready-to-Ship</option>
              </select>
            </Field>
            <Field label="Client *">
              <select
                className="fi"
                value={v.client_id}
                onChange={(e) => onClientChange(e.target.value)}
              >
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="fg full">
              <button
                type="button"
                className="btn bg sm"
                onClick={() => {
                  onClose();
                  goTo("clients");
                }}
              >
                <i className="ti ti-user-plus" /> Client not listed? Add them in
                Clients first
              </button>
            </div>
            <Field label="Item / Style *">
              <input className="fi" placeholder="e.g. Soleil Wrap Dress - Burnt Orange" value={v.item} onChange={set("item")} />
            </Field>
            <Field label="Collection">
              <select className="fi" value={v.collection} onChange={set("collection")}>
                <option>Soleil Collection</option>
                <option>Simona Man</option>
                <option>Custom / Bespoke</option>
                <option>Ankara Line</option>
                <option>Adire Line</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Amount (N) *">
              <input className="fi" type="number" placeholder="85000" value={v.amount} onChange={set("amount")} />
            </Field>
            <Field label="Payment Status">
              <select className="fi" value={v.payment_status} onChange={set("payment_status")}>
                <option>Unpaid</option>
                <option>50% Deposit</option>
                <option>Paid in Full</option>
              </select>
            </Field>
            <Field label="Order Date">
              <input className="fi" type="date" value={v.order_date} onChange={set("order_date")} />
            </Field>
            <Field label="Due Date">
              <input className="fi" type="date" value={v.due_date} onChange={set("due_date")} />
            </Field>
            <Field label="Current Status">
              <select className="fi" value={v.status} onChange={set("status")}>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned To">
              <select className="fi" value={v.assigned_to} onChange={set("assigned_to")}>
                <option>Director</option>
                <option>Social Media Manager</option>
                <option>QC/Fulfilment</option>
                <option>Tailor</option>
                <option>Rider</option>
              </select>
            </Field>
            <Field label="Notes" full>
              <textarea className="fi" placeholder="Fabric details, instructions, delivery address..." value={v.notes} onChange={set("notes")} />
            </Field>

            <div className="fsec">
              Measurements — SIMONA {v.gender === "Male" ? "Man" : "Woman"}
            </div>
            <Field label="Gender">
              <select className="fi" value={v.gender} onChange={set("gender")}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </Field>
            <div className="fg" aria-hidden="true" />
            {fieldsForGender(v.gender).map(([label, key]) => (
              <Field key={key} label={`${label} (in)`}>
                <input
                  className="fi"
                  value={v[key]}
                  onChange={set(key)}
                />
              </Field>
            ))}
          </div>
    </Modal>
  );
}
