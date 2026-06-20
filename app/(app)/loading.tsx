export default function Loading() {
  return (
    <div className="panel active" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="sk" style={{ height: 26, width: 200, marginBottom: 10 }} />
      <div className="sk" style={{ height: 12, width: 150, marginBottom: 22 }} />
      <div className="mrow">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 84 }} />
        ))}
      </div>
      <div className="sk" style={{ height: 220, marginTop: 8 }} />
    </div>
  );
}
