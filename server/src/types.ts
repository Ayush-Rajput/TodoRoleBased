import type { Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      membership?: {
        id: string;
        role: Role;
        projectId: string;
        userId: string;
      };
    }
  }
}
