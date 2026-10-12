import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/contract/history");
        setRecent(data.slice(0, 5));
        setStats({
          total: data.length,
          analyzed: data.filter((c) => c.status === "analyzed").length,
          highRisk: data.filter((c) => c.highCount > 0).length,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Hi {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Analyze contracts in seconds — know what you're signing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Contracts" value={stats?.total ?? "—"} />
        <StatCard label="Analyzed" value={stats?.analyzed ?? "—"} />
        <StatCard
          label="With High-Risk Clauses"
          value={stats?.highRisk ?? "—"}
          danger
        />
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
        <h2 className="text-xl font-bold mb-2">Analyze a new contract</h2>
        <p className="text-brand-100 mb-4 text-sm">
          Upload a PDF or DOCX — we'll flag risks and tell you what to negotiate.
        </p>
        <Link to="/upload" className="btn-secondary">
          Upload contract →
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">Recent contracts</h2>
          <Link to="/history" className="text-sm text-brand-600 font-medium">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            No contracts yet. Upload your first one.
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((c) => (
              <Link
                key={c._id}
                to={`/analysis/${c._id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="font-medium text-slate-800">{c.fileName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  {c.status === "analyzed" ? (
                    <span className="font-semibold">
                      {c.highCount} High · {c.mediumCount} Med
                    </span>
                  ) : (
                    <span className="text-amber-600">Not analyzed</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, danger }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div
        className={`text-3xl font-bold ${
          danger ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}