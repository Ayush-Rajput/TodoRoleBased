import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../db.js";
import { authenticate, requireProjectRole } from "../middleware/auth.js";
import { memberSchema, projectSchema } from "../validation.js";

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get("/", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: true
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({
      projects: projects.map((project) => ({
        ...project,
        progress: project.tasks.length
          ? Math.round((project.tasks.filter((task) => task.status === "DONE").length / project.tasks.length) * 100)
          : 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        members: { create: { userId: req.user!.id, role: Role.ADMIN } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: true
      }
    });

    res.status(201).json({ project: { ...project, progress: 0 } });
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:projectId", requireProjectRole(), async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { joinedAt: "asc" } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: [{ status: "asc" }, { dueDate: "asc" }]
        }
      }
    });

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project, myRole: req.membership!.role });
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/:projectId", requireProjectRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:projectId", requireProjectRole([Role.ADMIN]), async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.projectId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:projectId/members", requireProjectRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const data = memberSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return res.status(404).json({ message: "User must sign up before being added" });
    }

    const member = await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: user.id, projectId: req.params.projectId } },
      update: { role: data.role },
      create: { userId: user.id, projectId: req.params.projectId, role: data.role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:projectId/members/:userId", requireProjectRole([Role.ADMIN]), async (req, res, next) => {
  try {
    if (req.params.userId === req.user!.id) {
      return res.status(400).json({ message: "Admins cannot remove themselves" });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.projectId } }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
