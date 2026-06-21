"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// ACCOUNTS — edit this list to add team members.
//   label = what the person sees and taps (no real email is ever shown)
//   email = the internal "shadow" address used as the Supabase login
// The 6-digit PIN they type IS that account's Supabase password.
// ---------------------------------------------------------------------------
const ACCOUNTS: { label: string; email: string }[] = [
  { label: "Director", email: "admin@simona.local" },
  { label: "Team Member", email: "user1@simona.local" },
];

export function LoginScreen() {
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const errTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function selAccount(i: number) {
    setSel(i);
    setPin("");
    setErr(false);
  }

  function pp(d: string) {
    if (busy) return;
    setPin((prev) => (prev.length >= 6 ? prev : prev + d));
  }

  function pback() {
    if (busy) return;
    setPin((prev) => prev.slice(0, -1));
  }

  function pclear() {
    if (busy) return;
    setPin("");
  }

  // On 6 digits, sign in silently with the mapped shadow email + PIN.
  useEffect(() => {
    if (pin.length !== 6 || busy) return;
    const password = pin;
    const email = ACCOUNTS[sel].email;
    setBusy(true);

    (async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErr(true);
        setPin("");
        setBusy(false);
        if (errTimer.current) clearTimeout(errTimer.current);
        errTimer.current = setTimeout(() => setErr(false), 3000);
      } else {
        // Keep `busy` true while we navigate. Root redirects to the role's
        // landing page (admin -> /overview, user -> /clients).
        router.replace("/");
        router.refresh();
      }
    })();
  }, [pin, busy, sel, router]);

  useEffect(
    () => () => {
      if (errTimer.current) clearTimeout(errTimer.current);
    },
    []
  );

  return (
    <div id="loginScreen">
      <div className="lcard">
        <div className="lbrand">SIMONA</div>
        <div className="lsub">Operations Dashboard</div>

        <div className="plbl" style={{ marginBottom: 10 }}>
          Sign in as
        </div>
        <div
          className="rgrid"
          style={{
            gridTemplateColumns: `repeat(${ACCOUNTS.length}, minmax(0, 1fr))`,
          }}
        >
          {ACCOUNTS.map((a, i) => (
            <div
              key={a.email}
              className={"rbtn" + (sel === i ? " sel" : "")}
              onClick={() => selAccount(i)}
            >
              <i className="ti ti-user ricon" />
              <div className="rname">{a.label}</div>
            </div>
          ))}
        </div>

        <div className="plbl">Enter PIN</div>
        <div className="pdots">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={"pdot" + (i < pin.length ? " on" : "")} />
          ))}
        </div>
        <div className="perr" style={{ display: err ? "block" : "none" }}>
          <i
            className="ti ti-alert-circle"
            style={{ fontSize: 13, verticalAlign: -1, marginRight: 5 }}
          />
          Incorrect PIN. Please try again.
        </div>
        <div className="ppad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} className="pk" onClick={() => pp(d)} disabled={busy}>
              {d}
            </button>
          ))}
          <button className="pk util" onClick={pclear} disabled={busy}>
            Clear
          </button>
          <button className="pk" onClick={() => pp("0")} disabled={busy}>
            0
          </button>
          <button className="pk util" onClick={pback} disabled={busy}>
            <i className="ti ti-backspace" />
          </button>
        </div>
      </div>
    </div>
  );
}
