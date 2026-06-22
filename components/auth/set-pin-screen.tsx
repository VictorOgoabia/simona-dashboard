"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { landingFor } from "@/lib/access";
import type { AppRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

export function SetPinScreen({
  role,
  mustChange,
}: {
  role: AppRole;
  mustChange: boolean;
}) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onlyDigits = (s: string) => s.replace(/\D/g, "").slice(0, 6);
  const home = "/" + landingFor(role);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!/^\d{6}$/.test(pin)) {
      setErr("PIN must be exactly 6 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setErr("The PINs don't match.");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    // Changes ONLY the currently signed-in user's password (their PIN).
    const { error } = await supabase.auth.updateUser({ password: pin });
    if (error) {
      setErr(
        /different/i.test(error.message)
          ? "Your new PIN must be different from your current one."
          : error.message
      );
      setBusy(false);
      return;
    }

    // Clear the must-change flag (self-only, via SECURITY DEFINER rpc).
    const { error: rpcError } = await supabase.rpc("clear_must_change_pin");
    if (rpcError) {
      setErr("PIN updated, but finishing setup failed. Please try again.");
      setBusy(false);
      return;
    }

    router.replace(home);
    router.refresh();
  }

  return (
    <div id="loginScreen">
      <form className="lcard" onSubmit={submit}>
        <div className="lbrand">SIMONA</div>
        <div className="lsub">{mustChange ? "Set your PIN" : "Change PIN"}</div>

        <p
          style={{
            fontSize: 12,
            color: "var(--nt)",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          {mustChange
            ? "Welcome! For your security, choose a new 6-digit PIN. You'll use it to sign in from now on."
            : "Choose a new 6-digit PIN. You'll use it to sign in from now on."}
        </p>

        <div className="fg" style={{ marginBottom: 14 }}>
          <label className="flbl" htmlFor="newpin">
            New 6-digit PIN
          </label>
          <input
            id="newpin"
            className="pinf"
            style={{ width: "100%" }}
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(onlyDigits(e.target.value))}
            autoFocus
          />
        </div>

        <div className="fg" style={{ marginBottom: 14 }}>
          <label className="flbl" htmlFor="confirmpin">
            Confirm new PIN
          </label>
          <input
            id="confirmpin"
            className="pinf"
            style={{ width: "100%" }}
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="••••••"
            value={confirmPin}
            onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
          />
        </div>

        {err ? (
          <div className="perr" style={{ display: "block" }}>
            <i
              className="ti ti-alert-circle"
              style={{ fontSize: 13, verticalAlign: -1, marginRight: 5 }}
            />
            {err}
          </div>
        ) : null}

        <button
          className="btn bp"
          type="submit"
          disabled={busy}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {busy ? "Saving…" : mustChange ? "Set PIN" : "Change PIN"}
        </button>

        {!mustChange ? (
          <button
            type="button"
            className="btn bg"
            onClick={() => router.replace(home)}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            Cancel
          </button>
        ) : null}
      </form>
    </div>
  );
}
