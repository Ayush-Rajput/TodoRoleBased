import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../db.js";
import type { AuthUser } from "../types.js";

export function signToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: "7d" });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireProjectRole(roles: Role[] = [Role.ADMIN, Role.MEMBER]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId ?? req.body.projectId;

    if (!req.user || !projectId) {
      return res.status(400).json({ message: "Project context is required" });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } }
    });

    if (!membership || !roles.includes(membership.role)) {
      return res.status(403).json({ message: "You do not have access to this project" });
    }

    req.membership = membership;
    next();
  };
}
