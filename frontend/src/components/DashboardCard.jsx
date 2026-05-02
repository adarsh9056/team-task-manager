const DashboardCard = ({ title, value, subtitle, danger = false }) => {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${danger ? "border-red-300" : "border-slate-200"}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${danger ? "text-red-600" : "text-slate-900"}`}>{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
};

export default DashboardCard;
