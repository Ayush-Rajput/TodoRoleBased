import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../db.js";
import { authenticate, requireProjectRole } from "../middleware/auth.js";
import { taskSchema, taskUpdateSchema } from "../validation.js";

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.post("/projects/:projectId/tasks", requireProjectRole(), async (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body);
    if (!(await isAssigneeInProject(req.params.projectId, data.assigneeId))) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId,
        projectId: req.params.projectId,
        createdById: req.user!.id
      },
      include: taskIncludes
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch("/projects/:projectId/tasks/:taskId", requireProjectRole(), async (req, res, next) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!existing || existing.projectId !== req.params.projectId) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAdmin = req.membership!.role === Role.ADMIN;
    const isAssignee = existing.assigneeId === req.user!.id;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "Members can only update their assigned tasks" });
    }

    const data = taskUpdateSchema.parse(req.body);
    if (data.assigneeId !== undefined && !isAdmin) {
      return res.status(403).json({ message: "Only admins can reassign tasks" });
    }

    if (!(await isAssigneeInProject(req.params.projectId, data.assigneeId))) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...data,
        dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null
      },
      include: taskIncludes
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete("/projects/:projectId/tasks/:taskId", requireProjectRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task || task.projectId !== req.params.projectId) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

async function isAssigneeInProject(projectId: string, assigneeId?: string | null) {
  if (!assigneeId) return true;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: assigneeId, projectId } }
  });

  return Boolean(membership);
}

const taskIncludes = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } }
};
