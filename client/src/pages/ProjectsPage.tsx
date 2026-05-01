import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Project } from "../types";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    api<{ projects: Project[] }>("/projects").then((data) => setProjects(data.projects));
  }, []);

  async function createProject(event: FormEvent) {
    event.preventDefault();
    const data = await api<{ project: Project }>("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description })
    });
    setProjects((current) => [data.project, ...current]);
    setName("");
    setDescription("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="panel p-5">
        <h1 className="text-xl font-extrabold text-ink">New Project</h1>
        <form className="mt-4 space-y-4" onSubmit={createProject}>
          <label className="block text-sm font-semibold text-slate-700">
            Name
            <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Description
            <textarea className="field mt-1 min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <button className="btn btn-primary w-full">
            <Plus size={18} /> Create
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-ink">Projects</h2>
          <p className="text-sm text-slate-500">Open a project to manage its team and tasks.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} className="panel block p-5 transition hover:border-pine" key={project.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-ink">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || "No description"}</p>
                </div>
                <span className="rounded-md bg-mist px-2 py-1 text-xs font-bold text-pine">{project.members.length} members</span>
              </div>
              <div className="mt-5">
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-pine" style={{ width: `${project.progress ?? 0}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">{project.progress ?? 0}% complete · {project.tasks.length} tasks</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
