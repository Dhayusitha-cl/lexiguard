import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function History() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/contract/history");
      setContracts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this contract?")) return;
    try {
      await api.delete(`/contract/${id}`);
      setContracts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filtered = contracts.filter((c) =>
    c.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800">History</h1>
        <Link to="/upload" className="btn-primary">
          + New
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by file name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-6"
      />

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          {contracts.length === 0
            ? "No contracts yet."
            : "No contracts match your search."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <Link
                to={`/analysis/${c._id}`}
                className="flex-1 min-w-0 hover:opacity-80"
              >
                <div className="font-medium text-slate-800 truncate">
                  {c.fileName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {new Date(c.createdAt).toLocaleString()} ·{" "}
                  <span className="capitalize">{c.role}</span>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                {c.status === "analyzed" ? (
                  <div className="text-xs text-slate-500 text-right">
                    <div className="font-semibold text-red-600">
                      {c.highCount} High
                    </div>
                    <div className="text-amber-600">
                      {c.mediumCount} Medium
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600">Not analyzed</span>
                )}
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-slate-400 hover:text-red-600 transition p-2"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}