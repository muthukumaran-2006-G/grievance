export default function BarChart({ data, height = 200 }) {
  // data: [{ label, value, color }]
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height, padding: "0 4px" }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6, fontFamily: "var(--font-mono)" }}>{d.value}</div>
          <div
            style={{
              width: "60%",
              maxWidth: 46,
              height: `${(d.value / max) * (height - 60)}px`,
              minHeight: d.value > 0 ? 4 : 0,
              background: d.color,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.3s ease",
            }}
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.3 }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}
