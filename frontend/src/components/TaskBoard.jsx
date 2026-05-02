import { useNavigate } from "react-router-dom";
import TaskCard from "./TaskCard";

const columns = [
  { title: "To Do", key: "TODO" },
  { title: "In Progress", key: "IN_PROGRESS" },
  { title: "Done", key: "DONE" },
];

const TaskBoard = ({ tasks = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <div key={column.key} className="rounded-xl border border-slate-200 bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{column.title}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {columnTasks.length === 0 ? (
                <p className="text-xs text-slate-500">No tasks</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => navigate(`/tasks/${task.id}`)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
