import { Hono } from "hono";
import { auth } from "../auth";
import { prisma } from "../prisma";

const messagesRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/messages - get current user's chat messages
messagesRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const session = await prisma.chatSession.findUnique({
    where: { userId: user.id },
  });

  const messages = session ? JSON.parse(session.messages) : [];
  return c.json({ data: messages });
});

// PUT /api/messages - save/replace current user's chat messages
messagesRouter.put("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const body = await c.req.json();
  const messages = body.messages ?? [];

  await prisma.chatSession.upsert({
    where: { userId: user.id },
    update: { messages: JSON.stringify(messages) },
    create: { userId: user.id, messages: JSON.stringify(messages) },
  });

  return c.json({ data: { ok: true } });
});

// POST /api/messages - save/replace current user's chat messages (alias for PUT)
messagesRouter.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const body = await c.req.json();
  const messages = body.messages ?? [];

  await prisma.chatSession.upsert({
    where: { userId: user.id },
    update: { messages: JSON.stringify(messages) },
    create: { userId: user.id, messages: JSON.stringify(messages) },
  });

  return c.json({ data: { ok: true } });
});

// DELETE /api/messages - clear current user's chat messages
messagesRouter.delete("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  await prisma.chatSession.deleteMany({ where: { userId: user.id } });
  return c.json({ data: { ok: true } });
});

export { messagesRouter };
