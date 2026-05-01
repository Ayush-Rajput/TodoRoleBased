import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const now = new Date();
    const tasks = await prisma.task.findMany({
      where: {
        project: { members: { some: { userId: req.user!.id } } }
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
    });

    const assignedToMe = tasks.filter((task) => task.assigneeId === req.user!.id);
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== "DONE");

    res.json({
      summary: {
        total: tasks.length,
        assignedToMe: assignedToMe.length,
        overdue: overdue.length,
        todo: tasks.filter((task) => task.status === "TODO").length,
        inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
        done: tasks.filter((task) => task.status === "DONE").length
      },
      myTasks: assignedToMe.slice(0, 8),
      overdue: overdue.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
});
