import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RoleSelector from "../components/RoleSelector";
import { useAuth } from "../context/AuthContext";

export default function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(user?.role || "freelancer");
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFile = (e) => {
    const f = e.target.files[0];
    setError("");
    if (!f) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, DOCX, or TXT files allowed");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError("");
    setStage("uploading");

    try {
      // Step 1: Upload
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/contract/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const contractId = uploadRes.data.contractId;

      // Step 2: Analyze
      setStage("analyzing");
      await api.post("/contract/analyze", { contractId, role });

      // Step 3: Navigate
      setStage("done");
      navigate(`/analysis/${contractId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload or analysis failed");
      setStage("idle");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Upload Contract
      </h1>
      <p className="text-slate-500 mb-8">
        We'll extract clauses, score risk, and suggest what to negotiate.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="card p-8">
        <label className="block">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-brand-400 cursor-pointer transition">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFile}
              className="hidden"
              disabled={stage !== "idle"}
            />
            {file ? (
              <>
                <div className="text-3xl mb-2">📄</div>
                <div className="font-semibold text-slate-800">{file.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📤</div>
                <div className="font-semibold text-slate-800">
                  Click to select a file
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  PDF, DOCX, or TXT · Max 10MB
                </div>
              </>
            )}
          </div>
        </label>

        <div className="mt-6">
          <label className="label">Analyze as</label>
          <RoleSelector value={role} onChange={setRole} />
        </div>

        {stage !== "idle" && (
          <div className="mt-6 p-4 bg-brand-50 rounded-lg border border-brand-100">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-500 border-t-transparent" />
              <div className="font-medium text-brand-900">
                {stage === "uploading" && "Extracting text from file..."}
                {stage === "analyzing" && "AI is analyzing clauses... (~20s)"}
                {stage === "done" && "Done! Redirecting..."}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || stage !== "idle"}
          className="btn-primary w-full mt-6"
        >
          {stage === "idle"
            ? "Upload & Analyze"
            : stage === "uploading"
            ? "Uploading..."
            : stage === "analyzing"
            ? "Analyzing..."
            : "Done"}
        </button>
      </div>
    </div>
  );
}