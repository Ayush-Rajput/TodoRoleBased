import { format } from "date-fns";
import type { Task } from "../types";

const statusLabel = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

export function TaskRow({ task }: { task: Task }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{task.title}</p>
          <p className="text-xs text-slate-500">{task.project?.name ?? task.assignee?.name ?? "Unassigned"}</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-pine">{statusLabel[task.status]}</span>
      </div>
      {task.dueDate && <p className="mt-2 text-xs text-slate-500">Due {format(new Date(task.dueDate), "MMM d, yyyy")}</p>}
    </div>
  );
}
