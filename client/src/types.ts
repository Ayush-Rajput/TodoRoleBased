export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Member = {
  id: string;
  role: Role;
  joinedAt: string;
  user: User;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assigneeId?: string | null;
  assignee?: User | null;
  createdBy?: User;
  project?: { id: string; name: string };
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  tasks: Task[];
  progress?: number;
};
