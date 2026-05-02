const priorityStyles = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <button
      className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm hover:border-blue-300 ${
        isOverdue ? "border-red-300" : "border-slate-200"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Status: {task.status}</p>
      <p className={`mt-1 text-xs ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
      </p>
    </button>
  );
};

export default TaskCard;
