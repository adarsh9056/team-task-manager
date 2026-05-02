import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/projects");
      setProjects(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = "Project name is required";
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createProject = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setCreating(true);
      await api.post("/api/projects", form);
      setForm({ name: "", description: "" });
      setFormErrors({});
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        <form onSubmit={createProject} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Create Project</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <input
                placeholder="Project name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              {formErrors.name ? <p className="mt-1 text-xs text-red-600">{formErrors.name}</p> : null}
            </div>
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <button type="submit" className="mt-3 bg-blue-600 text-white hover:bg-blue-500" disabled={creating}>
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>

        {loading ? <p className="mt-4 text-sm text-slate-500">Loading projects...</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
            >
              <h3 className="font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
              <p className="mt-2 text-xs text-slate-600">Tasks: {project._count.tasks}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;
