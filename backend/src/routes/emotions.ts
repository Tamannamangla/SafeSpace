import { Hono } from "hono";
import { auth } from "../auth";
import { prisma } from "../prisma";

const emotionsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/emotions - get the user's emotional memory graph
emotionsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const memories = await prisma.emotionalMemory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Build aggregated patterns
  const emotionMap: Record<string, { count: number; totalIntensity: number }> = {};
  const triggerMap: Record<string, number> = {};
  const links: Array<{ emotion: string; trigger: string; count: number }> = [];
  const linkMap: Record<string, number> = {};

  for (const m of memories) {
    // Emotion aggregation
    const key = m.emotion;
    if (!emotionMap[key]) emotionMap[key] = { count: 0, totalIntensity: 0 };
    emotionMap[key]!.count++;
    emotionMap[key]!.totalIntensity += m.intensity;

    // Trigger aggregation
    triggerMap[m.trigger] = (triggerMap[m.trigger] || 0) + 1;

    // Link aggregation (emotion → trigger)
    const linkKey = `${m.emotion}→${m.trigger}`;
    linkMap[linkKey] = (linkMap[linkKey] || 0) + 1;
  }

  const emotions = Object.entries(emotionMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  const triggers = Object.entries(triggerMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  for (const [key, count] of Object.entries(linkMap)) {
    const parts = key.split("→");
    links.push({ emotion: parts[0] ?? "", trigger: parts[1] ?? "", count });
  }

  const recentEvents = memories.slice(0, 10).map((m) => ({
    id: m.id,
    emotion: m.emotion,
    trigger: m.trigger,
    event: m.event,
    intensity: m.intensity,
    createdAt: m.createdAt,
  }));

  return c.json({
    data: {
      emotions,
      triggers,
      links,
      recentEvents,
      totalMemories: memories.length,
    },
  });
});

export { emotionsRouter };
