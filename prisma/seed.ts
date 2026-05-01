import bcrypt from "bcryptjs";
import { PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Asha Admin", email: "admin@example.com", passwordHash }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: { name: "Mira Member", email: "member@example.com", passwordHash }
  });

  const project = await prisma.project.create({
    data: {
      name: "Launch Website",
      description: "Coordinate launch tasks, owners, and progress.",
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: member.id, role: Role.MEMBER }
        ]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Finalize homepage QA",
        description: "Check responsive layout and links before handoff.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id
      },
      {
        title: "Prepare demo script",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        projectId: project.id,
        assigneeId: admin.id,
        createdById: admin.id
      }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
