const styles = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RiskBadge({ level, size = "md" }) {
  const cls = styles[level] || styles.Low;
  const sizing =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${cls} ${sizing}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level} Risk
    </span>
  );
}