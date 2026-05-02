import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TaskDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tasks/${id}`);
      setTask(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const canUpdateStatus = useMemo(() => task?.assignedTo === user?.id, [task, user]);

  const updateStatus = async (status) => {
    if (!canUpdateStatus) return;

    try {
      setUpdating(true);
      await api.patch(`/api/tasks/${id}/status`, { status });
      await fetchTask();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to={task ? `/projects/${task.projectId}` : "/projects"} className="text-sm text-blue-600">
          Back to project
        </Link>

        {loading ? <p className="mt-4 text-sm text-slate-500">Loading task...</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {task ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{task.description || "No description provided"}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-100 p-3 text-sm">
                <p className="text-slate-500">Priority</p>
                <p className="font-semibold">{task.priority}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-sm">
                <p className="text-slate-500">Current Status</p>
                <p className="font-semibold">{task.status}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-sm">
                <p className="text-slate-500">Due Date</p>
                <p className="font-semibold">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-sm">
                <p className="text-slate-500">Assignee</p>
                <p className="font-semibold">{task.assignee?.name || "Unassigned"}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold">Update Status</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: "TODO", label: "To Do" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "DONE", label: "Done" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!canUpdateStatus || updating}
                    onClick={() => updateStatus(option.value)}
                    className={`border ${
                      task.status === option.value
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    } ${!canUpdateStatus ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {!canUpdateStatus ? (
                <p className="mt-2 text-xs text-slate-500">Only the assigned member can update status.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TaskDetailPage;
