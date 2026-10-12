export default function RedFlagSummary({ redFlags, summary, riskScore }) {
  const scoreColor =
    riskScore >= 60
      ? "text-red-600"
      : riskScore >= 30
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="space-y-4">
      {/* Risk score hero */}
      <div className="card p-6 text-center">
        <div className="text-sm text-slate-500 font-medium mb-1">
          Overall Risk Score
        </div>
        <div className={`text-5xl font-bold ${scoreColor}`}>{riskScore}</div>
        <div className="text-xs text-slate-400 mt-1">out of 100</div>
      </div>

      {/* Red flags */}
      {redFlags?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            🚩 Red Flags ({redFlags.length})
          </h3>
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <span className="text-red-500 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-2">📝 Summary</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}