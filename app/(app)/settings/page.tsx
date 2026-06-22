import Link from "next/link";

import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const APP_VERSION = "v2.0 · June 2026";

const Full = <span className="bdg bok">Full</span>;
const None = <span className="bdg bnt">No access</span>;

export default async function SettingsPage() {
  const session = await requirePage("settings"); // admin only

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginTime = user?.last_sign_in_at
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(user.last_sign_in_at))
    : "-";

  return (
    <div className="panel active">
      <div className="pgtitle">Settings</div>
      <div className="pgsub">Access, permissions &amp; session</div>

      {/* Access PINs — managed in Supabase, not the app */}
      <div className="ss">
        <div className="sttl">Access PINs</div>
        <div className="sdesc">
          How team members sign in, and how to change a PIN.
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--midnight)",
            padding: "13px 15px",
            background: "var(--linen)",
            borderRadius: 8,
            lineHeight: 1.7,
            border: "1px solid rgba(196,168,130,0.25)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <i
              className="ti ti-shield-lock"
              style={{ fontSize: 14, verticalAlign: -2, marginRight: 6, color: "var(--sand-dk)" }}
            />
            Each person signs in with their own 6-digit PIN — it&rsquo;s their
            Supabase account password, stored securely in Supabase Auth,{" "}
            <strong>not in this app or your browser</strong>. Everyone sets and
            changes their <strong>own</strong> PIN; no one (not even an admin)
            can see or set another person&rsquo;s permanent PIN.
          </div>
          <Link className="btn bp" href="/set-pin">
            <i className="ti ti-key" /> Change my PIN
          </Link>
          <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 500 }}>
            Adding a new team member (admin):
          </div>
          <ol style={{ margin: "0 0 8px 18px", padding: 0 }}>
            <li>
              In Supabase &rarr; <strong>Authentication &rarr; Users</strong>,
              create their account (e.g. <code>user2@simona.local</code>) with a{" "}
              <strong>temporary</strong> 6-digit PIN, and share it privately.
            </li>
            <li>
              Add them to the <code>ACCOUNTS</code> array in the login screen
              config and redeploy.
            </li>
            <li>
              On their first sign-in they&rsquo;re forced to set their own PIN —
              the temporary one stops working.
            </li>
          </ol>
        </div>
      </div>

      {/* Access Level Summary */}
      <div className="ss">
        <div className="sttl">Access Level Summary</div>
        <div className="sdesc">What each role can see and do.</div>
        <div className="twrap">
          <table className="tbl" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th>Module</th>
                <th>Admin</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Overview &amp; Metrics</td>
                <td>{Full}</td>
                <td>{None}</td>
              </tr>
              <tr>
                <td>Client CRM</td>
                <td>{Full}</td>
                <td>{Full}</td>
              </tr>
              <tr>
                <td>Order Tracker</td>
                <td>{Full}</td>
                <td>
                  <span className="bdg bin">Full · no financials</span>
                </td>
              </tr>
              <tr>
                <td>Production Queue</td>
                <td>{Full}</td>
                <td>{None}</td>
              </tr>
              <tr>
                <td>Weekly Planner</td>
                <td>{Full}</td>
                <td>{Full}</td>
              </tr>
              <tr>
                <td>Settings</td>
                <td>{Full}</td>
                <td>{None}</td>
              </tr>
              <tr>
                <td>Financials (amounts, payment, revenue)</td>
                <td>
                  <span className="bdg bok">Visible</span>
                </td>
                <td>
                  <span className="bdg bnt">Hidden</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Information */}
      <div className="ss">
        <div className="sttl">Session Information</div>
        <div className="igrid">
          <div className="irow">
            <span className="ikey">Role</span>
            <span className="ival">
              {session.role === "admin" ? "Admin" : "Staff"}
            </span>
          </div>
          <div className="irow">
            <span className="ikey">Signed in as</span>
            <span className="ival">
              {session.displayName || session.email || "-"}
            </span>
          </div>
          <div className="irow">
            <span className="ikey">Session Started</span>
            <span className="ival">{loginTime}</span>
          </div>
          <div className="irow">
            <span className="ikey">Version</span>
            <span className="ival">{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
