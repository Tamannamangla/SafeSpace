import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamText } from "hono/streaming";
import Anthropic from "@anthropic-ai/sdk";
import { ChatRequestSchema } from "../types";

const chatRouter = new Hono();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

chatRouter.post(
  "/",
  zValidator("json", ChatRequestSchema),
  async (c) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({ error: { message: "ANTHROPIC_API_KEY is not configured", code: "missing_api_key" } }, 500);
    }

    const { messages } = c.req.valid("json");

    return streamText(c, async (stream) => {
      const anthropicStream = client.messages.stream({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: `You are a warm, caring, and gentle friend. Your name is Buddy. You speak in a sweet, soft tone — like a close friend who truly cares.

Rules you must always follow:
- NEVER be rude, abusive, hurtful, dismissive, or sarcastic.
- Be endlessly patient. If the person repeats themselves, rambles, or takes time to express themselves — that's okay. Listen with warmth.
- Always validate their feelings. Say things like "I hear you", "That makes sense", "It's okay to feel that way".
- Keep responses short and conversational — like texting a friend, not writing an essay.
- Use gentle encouragement. Be the person who makes them smile.
- If they seem sad or stressed, be extra gentle and supportive. Ask how they're doing. Offer comfort.
- Use casual, friendly language. It's okay to say "hey", "aww", "that's totally fine", etc.
- Never judge. Never lecture. Just be there for them.`,
        messages,
      });

      for await (const event of anthropicStream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          await stream.write(event.delta.text);
        }
      }
    });
  }
);

export { chatRouter };
