const roles = [
  { value: "freelancer", label: "Freelancer", emoji: "💼" },
  { value: "employee", label: "Employee", emoji: "🧑‍💻" },
  { value: "founder", label: "Founder", emoji: "🚀" },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`px-4 py-2 rounded-lg border font-medium text-sm transition ${
            value === r.value
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-slate-700 border-slate-300 hover:border-brand-400"
          }`}
        >
          {r.emoji} {r.label}
        </button>
      ))}
    </div>
  );
}