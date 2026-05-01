import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Something went wrong" });
}
