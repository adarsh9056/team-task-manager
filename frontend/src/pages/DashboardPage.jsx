import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import api from "../api/axios";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/dashboard");
        setDashboard(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading dashboard...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {dashboard ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard title="Total Tasks" value={dashboard.totalTasks} />
              <DashboardCard title="To Do" value={dashboard.tasksByStatus.todo} />
              <DashboardCard title="In Progress" value={dashboard.tasksByStatus.inProgress} />
              <DashboardCard title="Done" value={dashboard.tasksByStatus.done} />
              <DashboardCard
                title="Overdue Tasks"
                value={dashboard.overdueTasks.length}
                subtitle="Not done and due date passed"
                danger
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Tasks Per User</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {dashboard.tasksPerUser.length === 0 ? (
                    <li>No assigned tasks yet.</li>
                  ) : (
                    dashboard.tasksPerUser.map((entry) => (
                      <li key={entry.userName} className="flex justify-between">
                        <span>{entry.userName}</span>
                        <span className="font-semibold">{entry.count}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Overdue Tasks</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {dashboard.overdueTasks.length === 0 ? (
                    <li className="text-slate-600">No overdue tasks.</li>
                  ) : (
                    dashboard.overdueTasks.map((task) => (
                      <li key={task.id} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700">
                        {task.title}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default DashboardPage;
