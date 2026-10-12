import { useState } from "react";
import RiskBadge from "./RiskBadge";

export default function ClauseCard({ clause, index }) {
  const [expanded, setExpanded] = useState(false);

  const borderColor =
    clause.risk === "High"
      ? "border-l-red-500"
      : clause.risk === "Medium"
      ? "border-l-amber-500"
      : "border-l-emerald-500";

  return (
    <div
      className={`card p-5 border-l-4 ${borderColor} hover:shadow-md transition`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            #{index + 1}
          </span>
          <RiskBadge level={clause.risk} size="sm" />
        </div>
      </div>

      <p
        className={`text-slate-800 leading-relaxed ${
          !expanded && clause.text.length > 200 ? "line-clamp-3" : ""
        }`}
      >
        {clause.text}
      </p>

      {clause.text.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-brand-600 text-sm font-medium mt-2 hover:underline"
        >
          {expanded ? "Show less" : "Show full clause"}
        </button>
      )}

      {clause.reason && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Why it matters
          </div>
          <p className="text-sm text-slate-700">{clause.reason}</p>
        </div>
      )}

      {clause.suggestion && (
        <div className="mt-3 p-3 bg-brand-50 border border-brand-100 rounded-lg">
          <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">
            💬 What to negotiate
          </div>
          <p className="text-sm text-brand-900">{clause.suggestion}</p>
        </div>
      )}
    </div>
  );
}