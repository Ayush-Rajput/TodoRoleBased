import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { api } from "../api";
import type { Task } from "../types";
import { TaskRow } from "../components/TaskRow";

type Dashboard = {
  summary: { total: number; assignedToMe: number; overdue: number; todo: number; inProgress: number; done: number };
  myTasks: Task[];
  overdue: Task[];
};

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api<Dashboard>("/dashboard").then(setData);
  }, []);

  if (!data) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  const stats = [
    { label: "Total tasks", value: data.summary.total, icon: ListTodo, color: "text-pine" },
    { label: "Assigned to me", value: data.summary.assignedToMe, icon: Clock3, color: "text-amber" },
    { label: "Overdue", value: data.summary.overdue, icon: AlertTriangle, color: "text-coral" },
    { label: "Completed", value: data.summary.done, icon: CheckCircle2, color: "text-pine" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
        <p className="text-sm text-slate-500">Track workload, deadlines, and overall progress.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div className="panel p-5" key={label}>
            <Icon className={color} size={24} />
            <p className="mt-4 text-3xl font-extrabold text-ink">{value}</p>
            <p className="text-sm font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">My Tasks</h2>
          <div className="mt-4 space-y-3">
            {data.myTasks.length ? data.myTasks.map((task) => <TaskRow task={task} key={task.id} />) : <p className="text-sm text-slate-500">No assigned tasks yet.</p>}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Overdue</h2>
          <div className="mt-4 space-y-3">
            {data.overdue.length ? data.overdue.map((task) => <TaskRow task={task} key={task.id} />) : <p className="text-sm text-slate-500">No overdue work.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
