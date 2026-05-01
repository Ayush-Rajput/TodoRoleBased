import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { loginSchema, signupSchema } from "../validation.js";
import { authenticate, signToken } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash },
      select: { id: true, name: true, email: true }
    });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const authUser = { id: user.id, name: user.name, email: user.email };
    const token = signToken(authUser);
    res.json({ token, user: authUser });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});
