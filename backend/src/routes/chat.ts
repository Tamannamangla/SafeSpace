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
        system: "You are a helpful, friendly assistant. Be concise and clear.",
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
