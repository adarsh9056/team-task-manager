import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    assignedTo: "",
  });

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/projects/${id}`);
      setProject(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const myMembership = useMemo(() => {
    if (!project || !user) return null;
    return project.members.find((member) => member.user.id === user.id) || null;
  }, [project, user]);

  const isAdmin = myMembership?.role === "ADMIN";

  const validateMemberEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMemberError("");

    if (!memberEmail.trim()) {
      setMemberError("Email is required");
      return;
    }

    if (!validateMemberEmail(memberEmail)) {
      setMemberError("Please provide a valid email");
      return;
    }

    try {
      setAddingMember(true);
      await api.post(`/api/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      await loadProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const validateTask = () => {
    if (!taskForm.title.trim()) {
      setTaskError("Task title is required");
      return false;
    }

    if (taskForm.dueDate) {
      const dueDate = new Date(taskForm.dueDate);
      const now = new Date();
      if (dueDate < now) {
        setTaskError("Due date cannot be in the past");
        return false;
      }
    }

    setTaskError("");
    return true;
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!validateTask()) return;

    try {
      setCreatingTask(true);
      await api.post("/api/tasks", {
        title: taskForm.title,
        description: taskForm.description || null,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
        priority: taskForm.priority,
        projectId: id,
        assignedTo: taskForm.assignedTo || null,
      });

      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        assignedTo: "",
      });

      await loadProject();
    } catch (err) {
      setTaskError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {loading ? <p className="text-sm text-slate-500">Loading project...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {project ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-sm text-slate-500">{project.description || "No description"}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
                <MemberList members={project.members} />

                {isAdmin ? (
                  <form onSubmit={handleAddMember} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold">Add Member</h3>
                    <input
                      className="mt-3"
                      placeholder="member@email.com"
                      value={memberEmail}
                      onChange={(event) => setMemberEmail(event.target.value)}
                    />
                    {memberError ? <p className="mt-1 text-xs text-red-600">{memberError}</p> : null}
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-500"
                    >
                      {addingMember ? "Adding..." : "Add Member"}
                    </button>
                  </form>
                ) : null}

                {isAdmin ? (
                  <form onSubmit={handleCreateTask} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold">Create Task</h3>
                    <div className="mt-3 space-y-3">
                      <input
                        placeholder="Task title"
                        value={taskForm.title}
                        onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                      />
                      <textarea
                        placeholder="Task description"
                        value={taskForm.description}
                        onChange={(event) =>
                          setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                      <input
                        type="datetime-local"
                        value={taskForm.dueDate}
                        onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                      />
                      <select
                        value={taskForm.priority}
                        onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                      <select
                        value={taskForm.assignedTo}
                        onChange={(event) => setTaskForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                      >
                        <option value="">Unassigned</option>
                        {project.members.map((member) => (
                          <option key={member.user.id} value={member.user.id}>
                            {member.user.name}
                          </option>
                        ))}
                      </select>
                      {taskError ? <p className="text-xs text-red-600">{taskError}</p> : null}
                      <button
                        type="submit"
                        disabled={creatingTask}
                        className="w-full bg-slate-900 text-white hover:bg-slate-700"
                      >
                        {creatingTask ? "Creating..." : "Create Task"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              <div className="lg:col-span-2">
                <TaskBoard tasks={project.tasks} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ProjectDetailPage;
