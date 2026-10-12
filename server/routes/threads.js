import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/threads?search=<term>&sort=<newest|oldest>
//
// Pushes filtering and sorting down into the database via
// Prisma `where` ({ contains: search, mode: "insensitive" })
// and `orderBy` ({ createdAt: sort === "oldest" ? "asc" : "desc" }).
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    const where = search
      ? {
          title: {
            contains: String(search),
            mode: "insensitive",
          },
        }
      : undefined;

    const orderBy = {
      createdAt: sort === "oldest" ? "asc" : "desc",
    };

    const threads = await prisma.thread.findMany({
      where,
      orderBy,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    res.json({ threads });
  } catch (error) {
    next(error);
  }
});

export default router;
