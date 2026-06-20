"use client";

import { useState, useTransition } from "react";

import { useShell } from "@/components/simona/shell-context";
import { Field } from "@/components/ui-kit/field";
import { Modal } from "@/components/ui-kit/modal";
import { useConfirm } from "@/components/ui-kit/confirm";
import { useToast } from "@/components/ui-kit/toast";
import { sb } from "@/lib/constants";
import {
  createClientRecord,
  deleteClientRecord,
  updateClientRecord,
  type ClientInput,
} from "@/app/(app)/clients/actions";
import type { AppRole } from "@/lib/supabase/auth";

export interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  tag: string | null;
  notes: string | null;
  fit_notes: string | null;
  uk_size: string | null;
  height_cm: string | null;
  bust_in: string | null;
  waist_in: string | null;
  hip_in: string | null;
  high_hip_in: string | null;
  shoulder_in: string | null;
  sleeve_in: string | null;
  back_in: string | null;
  torso_in: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_code: string | null;
  client_name: string | null;
  item: string | null;
  status: string | null;
  amount: number | null;
}

const MFIELDS: [string, keyof ClientRow][] = [
  ["Bust", "bust_in"],
  ["Waist", "waist_in"],
  ["Hip", "hip_in"],
  ["High Hip", "high_hip_in"],
  ["Shoulder", "shoulder_in"],
  ["Sleeve", "sleeve_in"],
  ["Back", "back_in"],
  ["Torso", "torso_in"],
];

const fullName = (c: ClientRow) => `${c.first_name} ${c.last_name}`;

type ModalState = { mode: "add" } | { mode: "edit"; client: ClientRow } | null;

export function ClientsView({
  clients,
  orders,
  role,
}: {
  clients: ClientRow[];
  orders: OrderRow[];
  role: AppRole;
}) {
  const { goTo } = useShell();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [, startTransition] = useTransition();

  const showAmount = role === "admin";

  const ql = q.toLowerCase();
  const fl = f.toLowerCase();
  const list = clients.filter(
    (c) =>
      `${c.first_name} ${c.last_name} ${c.phone ?? ""} ${c.email ?? ""}`
        .toLowerCase()
        .indexOf(ql) >= 0 && (fl ? (c.tag ?? "").toLowerCase() === fl : true)
  );

  const sel = selId ? clients.find((c) => c.id === selId) : null;

  function ordersFor(c: ClientRow) {
    return orders.filter((o) => o.client_name === fullName(c));
  }

  async function onDelete(c: ClientRow) {
    const ok = await confirm({
      title: "Delete client?",
      message: `This permanently removes ${c.first_name} ${c.last_name}'s profile.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteClientRecord(c.id);
        setSelId(null);
        toast({ title: "Client deleted", variant: "success" });
      } catch {
        toast({ title: "Could not delete client", variant: "error" });
      }
    });
  }

  return (
    <div className="panel active">
      <div className="fbetween" style={{ marginBottom: 4 }}>
        <div className="pgtitle">Client CRM</div>
        <div>
          <button className="btn bp" onClick={() => setModal({ mode: "add" })}>
            <i className="ti ti-plus" /> Add Client
          </button>
        </div>
      </div>
      <div className="pgsub">
        All client profiles, measurements &amp; order history
      </div>

      {!sel ? (
        <>
          <div className="sbar">
            <input
              className="fi"
              placeholder="Search by name, phone or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="fi"
              style={{ width: 165 }}
              value={f}
              onChange={(e) => setF(e.target.value)}
            >
              <option value="">All clients</option>
              <option value="vip">VIP</option>
              <option value="active">Active</option>
              <option value="new">New</option>
              <option value="diaspora">Diaspora</option>
            </select>
          </div>

          {!list.length ? (
            <div className="empty">
              <i className="ti ti-user-off" />
              <p>No clients found</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="twrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Size</th>
                      <th>Tag</th>
                      <th>Orders</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
                      <tr key={c.id} onClick={() => setSelId(c.id)}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              className="av"
                              style={{ width: 32, height: 32, fontSize: 11 }}
                            >
                              {c.first_name[0]}
                              {c.last_name[0]}
                            </div>
                            <span style={{ fontWeight: 500 }}>
                              {c.first_name} {c.last_name}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--nt)" }}>{c.phone || "-"}</td>
                        <td style={{ color: "var(--nt)" }}>
                          {c.location || "-"}
                        </td>
                        <td>
                          {c.bust_in
                            ? `${c.bust_in}/${c.waist_in}/${c.hip_in}`
                            : c.uk_size || "-"}
                        </td>
                        <td>
                          {c.tag ? <span className="bdg bsd">{c.tag}</span> : "-"}
                        </td>
                        <td>{ordersFor(c).length}</td>
                        <td>
                          <button
                            className="btn bg sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelId(c.id);
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
          )}
        </>
      ) : (
        <ClientDetail
          c={sel}
          orders={ordersFor(sel)}
          showAmount={showAmount}
          onBack={() => setSelId(null)}
          onEdit={() => setModal({ mode: "edit", client: sel })}
          onDelete={() => onDelete(sel)}
          onNewOrder={() => goTo("orders")}
        />
      )}

      {modal ? (
        <ClientModal
          initial={modal.mode === "edit" ? modal.client : null}
          onClose={() => setModal(null)}
          onSaved={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}

function ClientDetail({
  c,
  orders: ords,
  showAmount,
  onBack,
  onEdit,
  onDelete,
  onNewOrder,
}: {
  c: ClientRow;
  orders: OrderRow[];
  showAmount: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewOrder: () => void;
}) {
  const hm = c.bust_in || c.waist_in || c.hip_in;

  return (
    <div>
      <button className="btn bg sm" style={{ marginBottom: 15 }} onClick={onBack}>
        <i className="ti ti-arrow-left" /> Back
      </button>

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            marginBottom: 15,
          }}
        >
          <div className="av" style={{ width: 54, height: 54, fontSize: 19 }}>
            {c.first_name[0]}
            {c.last_name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 500 }}>
              {c.first_name} {c.last_name}
            </div>
            <div className="muted">{c.location}</div>
            {c.tag ? (
              <span className="bdg bsd" style={{ marginTop: 5 }}>
                {c.tag}
              </span>
            ) : null}
          </div>
          <button className="btn bg sm" onClick={onEdit}>
            <i className="ti ti-edit" /> Edit
          </button>
          <button className="btn bd sm" onClick={onDelete}>
            <i className="ti ti-trash" /> Delete
          </button>
        </div>
        <div className="igrid">
          <div className="irow">
            <span className="ikey">Phone</span>
            <span className="ival">{c.phone || "-"}</span>
          </div>
          <div className="irow">
            <span className="ikey">Email</span>
            <span className="ival">{c.email || "-"}</span>
          </div>
          <div className="irow" style={{ gridColumn: "1/-1" }}>
            <span className="ikey">Notes</span>
            <span className="ival">{c.notes || "-"}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardttl" style={{ marginBottom: 11 }}>
          Measurements
        </div>
        {!hm ? (
          <span className="muted">
            UK Size on file: <strong>{c.uk_size || "Not recorded"}</strong>
          </span>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--nt)", marginBottom: 9 }}>
              UK Size: {c.uk_size || "-"} &middot; Height:{" "}
              {c.height_cm ? c.height_cm + "cm" : "-"}
            </div>
            <div className="mgrid">
              {MFIELDS.map(([label, key]) => (
                <div className="mi" key={label}>
                  <div className="mik">{label}</div>
                  <div className="miv">{c[key] ? `${c[key]} in` : "-"}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {c.fit_notes ? (
          <div
            style={{
              marginTop: 11,
              padding: "9px 12px",
              background: "var(--linen)",
              borderRadius: 7,
              fontSize: 12,
              lineHeight: 1.5,
              border: "1px solid rgba(196,168,130,0.2)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "var(--nt)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Fit notes:{" "}
            </span>
            {c.fit_notes}
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="cardhd">
          <span className="cardttl">Order History</span>
          <button className="btn bg sm" onClick={onNewOrder}>
            <i className="ti ti-plus" /> New Order
          </button>
        </div>
        {ords.length ? (
          <div className="twrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  {showAmount ? <th>Amount</th> : null}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ords.map((o) => (
                  <tr key={o.id}>
                    <td style={{ color: "var(--nt)", fontSize: 11 }}>
                      {o.order_code || o.id.slice(0, 8)}
                    </td>
                    <td>{o.item}</td>
                    {showAmount ? (
                      <td>
                        {o.amount != null
                          ? "N" + Number(o.amount).toLocaleString()
                          : "-"}
                      </td>
                    ) : null}
                    <td>
                      <span className={"bdg " + sb(o.status || "")}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ padding: 15 }}>
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Add / Edit modal ------------------------------------------------------

const FORM_INIT: ClientInput = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  location: "",
  tag: "New",
  notes: "",
  fit_notes: "",
  uk_size: "",
  height_cm: "",
  bust_in: "",
  waist_in: "",
  hip_in: "",
  high_hip_in: "",
  shoulder_in: "",
  sleeve_in: "",
  back_in: "",
  torso_in: "",
};

function toForm(c: ClientRow): ClientInput {
  return {
    first_name: c.first_name ?? "",
    last_name: c.last_name ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    location: c.location ?? "",
    tag: c.tag ?? "New",
    notes: c.notes ?? "",
    fit_notes: c.fit_notes ?? "",
    uk_size: c.uk_size ?? "",
    height_cm: c.height_cm ?? "",
    bust_in: c.bust_in ?? "",
    waist_in: c.waist_in ?? "",
    hip_in: c.hip_in ?? "",
    high_hip_in: c.high_hip_in ?? "",
    shoulder_in: c.shoulder_in ?? "",
    sleeve_in: c.sleeve_in ?? "",
    back_in: c.back_in ?? "",
    torso_in: c.torso_in ?? "",
  };
}

function ClientModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: ClientRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [v, setV] = useState<ClientInput>(initial ? toForm(initial) : FORM_INIT);
  const [pending, startTransition] = useTransition();

  const set =
    (k: keyof ClientInput) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  function save() {
    if (!v.first_name.trim() || !v.last_name.trim()) {
      toast({ title: "First and last name are required.", variant: "error" });
      return;
    }
    const input: ClientInput = {
      ...v,
      first_name: v.first_name.trim(),
      last_name: v.last_name.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      location: v.location.trim(),
      notes: v.notes.trim(),
      fit_notes: v.fit_notes.trim(),
    };
    startTransition(async () => {
      try {
        if (initial) await updateClientRecord(initial.id, input);
        else await createClientRecord(input);
        toast({
          title: initial ? "Client updated" : "Client added",
          variant: "success",
        });
        onSaved();
      } catch {
        toast({ title: "Could not save client", variant: "error" });
      }
    });
  }

  return (
    <Modal
      title={initial ? "Edit Client Profile" : "New Client Profile"}
      onClose={onClose}
      footer={
        <>
          <button className="btn bg" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button className="btn bp" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save Client"}
          </button>
        </>
      }
    >
      <div className="fg2">
            <Field label="First Name *">
              <input className="fi" placeholder="Adaeze" value={v.first_name} onChange={set("first_name")} />
            </Field>
            <Field label="Last Name *">
              <input className="fi" placeholder="Okafor" value={v.last_name} onChange={set("last_name")} />
            </Field>
            <Field label="Phone / WhatsApp *">
              <input className="fi" placeholder="+234 801 234 5678" value={v.phone} onChange={set("phone")} />
            </Field>
            <Field label="Email">
              <input className="fi" placeholder="adaeze@email.com" value={v.email} onChange={set("email")} />
            </Field>
            <Field label="Location">
              <input className="fi" placeholder="Lagos - Victoria Island" value={v.location} onChange={set("location")} />
            </Field>
            <Field label="Client Tag">
              <select className="fi" value={v.tag} onChange={set("tag")}>
                <option>New</option>
                <option>Active</option>
                <option>VIP</option>
                <option>Diaspora</option>
              </select>
            </Field>
            <Field label="Notes" full>
              <textarea className="fi" placeholder="Style preferences, referral source..." value={v.notes} onChange={set("notes")} />
            </Field>
            <div className="fsec">Body Measurements</div>
            <Field label="UK Dress Size">
              <select className="fi" value={v.uk_size} onChange={set("uk_size")}>
                <option value="">- if no full measurements -</option>
                <option>UK 6</option>
                <option>UK 8</option>
                <option>UK 10</option>
                <option>UK 12</option>
                <option>UK 14</option>
                <option>UK 16</option>
                <option>UK 18</option>
                <option>UK 20</option>
              </select>
            </Field>
            <Field label="Height (cm)">
              <input className="fi" placeholder="165" value={v.height_cm} onChange={set("height_cm")} />
            </Field>
            <Field label="Bust (in)">
              <input className="fi" placeholder="36" value={v.bust_in} onChange={set("bust_in")} />
            </Field>
            <Field label="Waist (in)">
              <input className="fi" placeholder="28" value={v.waist_in} onChange={set("waist_in")} />
            </Field>
            <Field label="Hip (in)">
              <input className="fi" placeholder="40" value={v.hip_in} onChange={set("hip_in")} />
            </Field>
            <Field label="High Hip (in)">
              <input className="fi" placeholder="36" value={v.high_hip_in} onChange={set("high_hip_in")} />
            </Field>
            <Field label="Shoulder (in)">
              <input className="fi" placeholder="14.5" value={v.shoulder_in} onChange={set("shoulder_in")} />
            </Field>
            <Field label="Sleeve (in)">
              <input className="fi" placeholder="23" value={v.sleeve_in} onChange={set("sleeve_in")} />
            </Field>
            <Field label="Back Length (in)">
              <input className="fi" placeholder="15.5" value={v.back_in} onChange={set("back_in")} />
            </Field>
            <Field label="Torso / Full (in)">
              <input className="fi" placeholder="58" value={v.torso_in} onChange={set("torso_in")} />
            </Field>
            <Field label="Fit Notes" full>
              <textarea className="fi" placeholder="e.g. Extra ease at hips, narrow shoulders..." style={{ minHeight: 54 }} value={v.fit_notes} onChange={set("fit_notes")} />
            </Field>
          </div>
    </Modal>
  );
}
