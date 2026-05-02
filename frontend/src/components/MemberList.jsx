const MemberList = ({ members = [] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Project Members</h3>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{member.user.name}</p>
              <p className="text-xs text-slate-500">{member.user.email}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                member.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
              }`}
            >
              {member.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;
