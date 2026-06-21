"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createTask,
  deleteTask,
  setTaskDone,
  type NewTaskInput,
} from "@/app/(app)/planner/actions";
import { Field } from "@/components/ui-kit/field";
import { Modal } from "@/components/ui-kit/modal";
import { useToast } from "@/components/ui-kit/toast";
import { PCOLS, PRCOLS } from "@/lib/constants";

export interface TaskRow {
  id: string;
  task: string;
  due_date: string | null;
  pillar: string | null;
  assigned_to: string | null;
  priority: string | null;
  done: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WD = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function PlannerView({ tasks }: { tasks: TaskRow[] }) {
  const toast = useToast();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  // Local copy so add/tick/delete update the UI instantly; re-synced to the
  // server data whenever it changes (after a revalidation).
  const [rows, setRows] = useState<TaskRow[]>(tasks);
  const [, startTransition] = useTransition();

  useEffect(() => setRows(tasks), [tasks]);

  const isDone = (t: TaskRow) => t.done;

  const today = new Date();
  const sow = new Date(today);
  const dy = today.getDay();
  sow.setDate(today.getDate() + (dy === 0 ? -6 : 1 - dy));
  const label =
    "Week of " +
    sow.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const g: Record<string, TaskRow[]> = {};
  DAYS.forEach((d) => {
    g[d] = [];
  });
  rows.forEach((t) => {
    if (!t.due_date) return;
    const wd = WD[new Date(t.due_date).getDay()];
    if (g[wd]) g[wd].push(t);
  });

  const dn = rows.filter(isDone).length;
  const tot = rows.length;
  const pct = tot ? Math.round((dn / tot) * 100) : 0;

  function tick(t: TaskRow, val: boolean) {
    setRows((prev) =>
      prev.map((r) => (r.id === t.id ? { ...r, done: val } : r))
    );
    startTransition(async () => {
      try {
        await setTaskDone(t.id, val);
      } catch {
        setRows((prev) =>
          prev.map((r) => (r.id === t.id ? { ...r, done: !val } : r))
        );
        toast({ title: "Could not update task", variant: "error" });
      }
    });
  }

  function remove(t: TaskRow) {
    const snapshot = rows;
    // Optimistically drop it from the UI.
    setRows((prev) => prev.filter((r) => r.id !== t.id));
    startTransition(async () => {
      try {
        await deleteTask(t.id);
        toast({ title: "Task deleted", variant: "success" });
        router.refresh();
      } catch (e) {
        setRows(snapshot); // restore on failure
        toast({
          title: "Could not delete task: " + (e as Error).message,
          variant: "error",
        });
      }
    });
  }

  return (
    <div className="panel active">
      <div className="fbetween" style={{ marginBottom: 4 }}>
        <div className="pgtitle">Weekly Planner</div>
        <button className="btn bp" onClick={() => setShowAdd(true)}>
          <i className="ti ti-plus" /> Add Task
        </button>
      </div>

      <div className="pgsub">{label}</div>

      <div className="card" style={{ marginBottom: 15 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>Overall completion</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{pct}%</span>
        </div>
        <div className="pbar">
          <div className="pfill" style={{ width: pct + "%" }} />
        </div>
        <div className="muted mt8">
          {dn} done &middot; {tot - dn} remaining
        </div>
      </div>

      <div className="kgrid">
        {DAYS.map((d) => (
          <div className="kcol" key={d}>
            <div className="kcolttl">
              {d}
              <span className="bdg bsd" style={{ fontSize: 9 }}>
                {g[d].length}
              </span>
            </div>
            {g[d].length ? (
              g[d].map((t) => (
                <div
                  className="kcard"
                  key={t.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    position: "relative",
                    paddingRight: 36,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isDone(t)}
                    onChange={(e) => tick(t, e.target.checked)}
                    style={{
                      accentColor: "var(--sand)",
                      marginTop: 2,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        textDecoration: isDone(t) ? "line-through" : undefined,
                        color: isDone(t) ? "var(--nt)" : undefined,
                      }}
                    >
                      {t.task}
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      {t.pillar ? (
                        <span
                          className={"bdg " + (PCOLS[t.pillar] || "bnt")}
                          style={{ fontSize: 9 }}
                        >
                          {t.pillar}
                        </span>
                      ) : null}
                      {t.priority ? (
                        <span
                          className={"bdg " + (PRCOLS[t.priority] || "bnt")}
                          style={{ fontSize: 9 }}
                        >
                          {t.priority}
                        </span>
                      ) : null}
                      {t.assigned_to ? (
                        <span className="bdg bnt" style={{ fontSize: 9 }}>
                          {t.assigned_to}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    className="btn bg sm"
                    aria-label="Delete task"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 30,
                      height: 28,
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => remove(t)}
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--nt)",
                  textAlign: "center",
                  padding: 8,
                }}
              >
                No tasks
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd ? <AddTaskModal onClose={() => setShowAdd(false)} /> : null}
    </div>
  );
}

// --- Add task modal --------------------------------------------------------

const TASK_INIT = {
  task: "",
  due_date: "",
  pillar: "Production",
  assigned_to: "Director",
  priority: "Normal",
};

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(TASK_INIT);
  const [pending, startTransition] = useTransition();
  const set =
    (k: keyof typeof TASK_INIT) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  function save() {
    if (!v.task.trim()) {
      toast({ title: "Task description is required.", variant: "error" });
      return;
    }
    const input: NewTaskInput = {
      task: v.task.trim(),
      due_date: v.due_date || null,
      pillar: v.pillar,
      assigned_to: v.assigned_to,
      priority: v.priority,
    };
    startTransition(async () => {
      try {
        await createTask(input);
        toast({ title: "Task added", variant: "success" });
        onClose();
      } catch {
        toast({ title: "Could not add task", variant: "error" });
      }
    });
  }

  return (
    <Modal
      title="Add Task"
      onClose={onClose}
      footer={
        <>
          <button className="btn bg" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button className="btn bp" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Add Task"}
          </button>
        </>
      }
    >
      <div className="fg2">
            <Field label="Task *" full>
              <input className="fi" placeholder="Describe the task..." value={v.task} onChange={set("task")} />
            </Field>
            <Field label="Due Date">
              <input className="fi" type="date" value={v.due_date} onChange={set("due_date")} />
            </Field>
            <Field label="Pillar">
              <select className="fi" value={v.pillar} onChange={set("pillar")}>
                <option>Production</option>
                <option>QC/Fulfilment</option>
                <option>Content and Marketing</option>
                <option>Client Relations</option>
                <option>Operations</option>
                <option>Finance</option>
                <option>People</option>
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
            <Field label="Priority">
              <select className="fi" value={v.priority} onChange={set("priority")}>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </Field>
          </div>
    </Modal>
  );
}
