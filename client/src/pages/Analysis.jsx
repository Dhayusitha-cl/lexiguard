import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ClauseCard from "../components/ClauseCard";
import RedFlagSummary from "../components/RedFlagSummary";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/contract/${id}`);
        setContract(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Contract not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (contract.status !== "analyzed") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">
          This contract hasn't been analyzed yet.
        </p>
        <Link to="/upload" className="btn-primary">
          Analyze now
        </Link>
      </div>
    );
  }

  const filtered =
    filter === "All"
      ? contract.clauses
      : contract.clauses.filter((c) => c.risk === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="text-sm text-slate-500 mb-1">Analysis result</div>
        <h1 className="text-2xl font-bold text-slate-800">
          {contract.fileName}
        </h1>
        <div className="text-xs text-slate-400 mt-1">
          Analyzed as <span className="capitalize">{contract.role}</span> ·{" "}
          {new Date(contract.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: clauses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {["All", "High", "Medium", "Low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  filter === f
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand-400"
                }`}
              >
                {f}
                {f !== "All" && (
                  <span className="ml-1.5 opacity-70">
                    {contract.clauses.filter((c) => c.risk === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.map((c, i) => (
            <ClauseCard key={i} clause={c} index={i} />
          ))}

          {filtered.length === 0 && (
            <div className="card p-8 text-center text-slate-500">
              No clauses with this risk level.
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 self-start">
          <RedFlagSummary
            redFlags={contract.redFlags}
            summary={contract.summary}
            riskScore={contract.riskScore}
          />
        </div>
      </div>
    </div>
  );
}