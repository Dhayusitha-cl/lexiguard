import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Compare() {
  const [contracts, setContracts] = useState([]);
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/contract/history");
      setContracts(data.filter((c) => c.status === "analyzed"));
    };
    load();
  }, []);

  const handleCompare = async () => {
    setError("");
    setResult(null);
    if (!aId || !bId || aId === bId) {
      setError("Pick two different analyzed contracts");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/contract/compare", {
        contractIdA: aId,
        contractIdB: bId,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Compare failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Compare Contracts
      </h1>
      <p className="text-slate-500 mb-8">
        Compare two contract versions side by side.
      </p>

      {contracts.length < 2 && (
        <div className="card p-6 mb-6 bg-amber-50 border-amber-200">
          <p className="text-amber-800 text-sm">
            You need at least two analyzed contracts to compare.
          </p>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contract A</label>
            <select
              value={aId}
              onChange={(e) => setAId(e.target.value)}
              className="input-field"
            >
              <option value="">Select...</option>
              {contracts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fileName} — Score {c.riskScore}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Contract B</label>
            <select
              value={bId}
              onChange={(e) => setBId(e.target.value)}
              className="input-field"
            >
              <option value="">Select...</option>
              {contracts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fileName} — Score {c.riskScore}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}
        <button
          onClick={handleCompare}
          disabled={!aId || !bId || loading}
          className="btn-primary mt-4"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <CompareColumn label="Contract A" data={result.a} />
          <CompareColumn label="Contract B" data={result.b} />
          <div className="md:col-span-2 card p-5">
            <h3 className="font-bold text-slate-800 mb-3">Delta</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <DeltaCell
                label="Risk score"
                value={result.delta.riskScore}
                invert
              />
              <DeltaCell label="High clauses" value={result.delta.highCount} invert />
              <div className="p-3 bg-brand-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Safer contract</div>
                <div className="font-bold text-brand-700">
                  {result.delta.saferContractId === result.a.id ? "A" : "B"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareColumn({ label, data }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500 font-semibold uppercase mb-1">
        {label}
      </div>
      <div className="font-bold text-slate-800 truncate mb-4">
        {data.fileName}
      </div>
      <div className="space-y-3 text-sm">
        <Row label="Risk score" value={data.riskScore} />
        <Row label="High" value={data.highCount} red />
        <Row label="Medium" value={data.mediumCount} amber />
        <Row label="Low" value={data.lowCount} green />
      </div>
      {data.redFlags?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">
            Top flags
          </div>
          <ul className="text-xs text-slate-600 space-y-1">
            {data.redFlags.slice(0, 3).map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, red, amber, green }) {
  const color = red
    ? "text-red-600"
    : amber
    ? "text-amber-600"
    : green
    ? "text-emerald-600"
    : "text-slate-800";
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function DeltaCell({ label, value, invert }) {
  const isBad = invert ? value > 0 : value < 0;
  const isGood = invert ? value < 0 : value > 0;
  const color = isBad
    ? "text-red-600"
    : isGood
    ? "text-emerald-600"
    : "text-slate-700";
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`font-bold ${color}`}>
        {value > 0 ? "+" : ""}
        {value}
      </div>
    </div>
  );
}