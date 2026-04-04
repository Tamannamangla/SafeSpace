import { Hono } from "hono";
import { auth } from "../auth";
import { prisma } from "../prisma";
import { encrypt, safeDecrypt } from "../lib/encryption";

const reportsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/reports - list all reports for current user (without full reportData to keep it light)
reportsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const reports = await prisma.savedReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, sessionId: true, riskLevel: true, wellbeing: true, createdAt: true },
  });

  return c.json({ data: reports });
});

// GET /api/reports/:id - get full report data
reportsRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const report = await prisma.savedReport.findFirst({
    where: { id: c.req.param("id"), userId: user.id },
  });

  if (!report) return c.json({ error: { message: "Not found" } }, 404);

  const decryptedData = safeDecrypt(report.reportData);
  return c.json({ data: { ...report, reportData: JSON.parse(decryptedData) } });
});

// POST /api/reports - save a new report
reportsRouter.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const body = await c.req.json();
  const { sessionId, reportData, riskLevel, wellbeing } = body;

  const encryptedData = encrypt(JSON.stringify(reportData));

  const saved = await prisma.savedReport.create({
    data: {
      userId: user.id,
      sessionId: sessionId ?? "unknown",
      reportData: encryptedData,
      riskLevel: riskLevel ?? "low",
      wellbeing: wellbeing ?? 5,
    },
  });

  return c.json({ data: { id: saved.id, createdAt: saved.createdAt } });
});

export { reportsRouter };
