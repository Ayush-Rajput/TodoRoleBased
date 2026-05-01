import { FormEvent, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Save, Trash2, UserPlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import type { Member, Project, Role, Task, TaskPriority, TaskStatus } from "../types";

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
const statusText = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" };

export function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [myRole, setMyRole] = useState<Role>("MEMBER");
  const [error, setError] = useState("");

  async function loadProject() {
    const data = await api<{ project: Project; myRole: Role }>(`/projects/${projectId}`);
    setProject(data.project);
    setMyRole(data.myRole);
  }

  useEffect(() => {
    loadProject().catch((err) => setError(err instanceof ApiError ? err.message : "Unable to load project"));
  }, [projectId]);

  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    project?.tasks.forEach((task) => groups[task.status].push(task));
    return groups;
  }, [project]);

  async function updateTask(taskId: string, patch: Partial<Task>) {
    await api(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
    await loadProject();
  }

  async function deleteTask(taskId: string) {
    await api(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    await loadProject();
  }

  if (error) return <p className="rounded-md bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>;
  if (!project) return <p className="text-sm text-slate-500">Loading project...</p>;

  const isAdmin = myRole === "ADMIN";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pine">{myRole}</p>
          <h1 className="text-3xl font-extrabold text-ink">{project.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{project.description || "No description added."}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-right">
          <p className="text-2xl font-extrabold text-ink">{project.tasks.filter((task) => task.status === "DONE").length}/{project.tasks.length}</p>
          <p className="text-xs font-semibold text-slate-500">tasks complete</p>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <div className="panel min-h-72 p-4" key={status}>
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-500">{statusText[status]}</h2>
              <div className="space-y-3">
                {grouped[status].map((task) => (
                  <TaskCard
                    task={task}
                    members={project.members}
                    isAdmin={isAdmin}
                    onUpdate={(patch) => updateTask(task.id, patch)}
                    onDelete={() => deleteTask(task.id)}
                    key={task.id}
                  />
                ))}
                {!grouped[status].length && <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">No tasks here.</p>}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          <TaskForm members={project.members} projectId={project.id} onCreated={loadProject} />
          <MemberPanel members={project.members} projectId={project.id} isAdmin={isAdmin} onChanged={loadProject} />
        </aside>
      </section>
    </div>
  );
}

function TaskCard({
  task,
  members,
  isAdmin,
  onUpdate,
  onDelete
}: {
  task: Task;
  members: Member[];
  isAdmin: boolean;
  onUpdate: (patch: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-ink">{task.title}</h3>
          {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ${task.priority === "HIGH" ? "bg-coral/10 text-coral" : task.priority === "MEDIUM" ? "bg-amber/10 text-amber" : "bg-pine/10 text-pine"}`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <select className="field" value={task.status} onChange={(event) => onUpdate({ status: event.target.value as TaskStatus })}>
          {statuses.map((status) => <option value={status} key={status}>{statusText[status]}</option>)}
        </select>

        {isAdmin && (
          <select className="field" value={task.assigneeId ?? ""} onChange={(event) => onUpdate({ assigneeId: event.target.value || null })}>
            <option value="">Unassigned</option>
            {members.map((member) => <option value={member.user.id} key={member.id}>{member.user.name}</option>)}
          </select>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{task.assignee?.name ?? "Unassigned"}</span>
        <span>{task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No due date"}</span>
      </div>

      {isAdmin && (
        <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-coral" onClick={onDelete}>
          <Trash2 size={14} /> Delete
        </button>
      )}
    </article>
  );
}

function TaskForm({ members, projectId, onCreated }: { members: Member[]; projectId: string; onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        assigneeId: assigneeId || null,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      })
    });
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority("MEDIUM");
    setDueDate("");
    await onCreated();
  }

  return (
    <form className="panel space-y-3 p-5" onSubmit={submit}>
      <h2 className="text-lg font-bold text-ink">Create Task</h2>
      <input className="field" placeholder="Task title" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
      <textarea className="field min-h-20" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
      <select className="field" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
        <option value="">Unassigned</option>
        {members.map((member) => <option value={member.user.id} key={member.id}>{member.user.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select className="field" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
          {priorities.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <input className="field" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      <button className="btn btn-primary w-full">
        <Save size={18} /> Add task
      </button>
    </form>
  );
}

function MemberPanel({ members, projectId, isAdmin, onChanged }: { members: Member[]; projectId: string; isAdmin: boolean; onChanged: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [message, setMessage] = useState("");

  async function addMember(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role })
      });
      setEmail("");
      setRole("MEMBER");
      await onChanged();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Unable to add member");
    }
  }

  return (
    <section className="panel p-5">
      <h2 className="text-lg font-bold text-ink">Team</h2>
      <div className="mt-4 space-y-3">
        {members.map((member) => (
          <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3" key={member.id}>
            <div>
              <p className="text-sm font-bold text-ink">{member.user.name}</p>
              <p className="text-xs text-slate-500">{member.user.email}</p>
            </div>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-pine">{member.role}</span>
          </div>
        ))}
      </div>

      {isAdmin && (
        <form className="mt-5 space-y-3" onSubmit={addMember}>
          <input className="field" type="email" placeholder="member@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <select className="field" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          {message && <p className="text-sm font-semibold text-coral">{message}</p>}
          <button className="btn btn-secondary w-full">
            <UserPlus size={18} /> Add member
          </button>
        </form>
      )}
    </section>
  );
}
