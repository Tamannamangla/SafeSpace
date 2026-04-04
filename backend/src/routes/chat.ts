import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamText } from "hono/streaming";
import Anthropic from "@anthropic-ai/sdk";
import { ChatRequestSchema } from "../types";
import { auth } from "../auth";
import { extractAndSaveEmotions, loadEmotionalContext } from "../lib/emotional-memory";
import { detectCrisis, getCrisisPromptInjection } from "../lib/crisis-detection";

const chatRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BASE_SYSTEM_PROMPT = `You are a compassionate, patient support companion. Your name is Buddy. The person you are speaking with may be a victim of something difficult — treat them with the utmost care, respect, and sensitivity.

Rules you must always follow:
- NEVER be rude, dismissive, sarcastic, or hurtful in any way.
- Do NOT rush or accelerate the conversation. Go at their pace. Let them lead.
- Be endlessly patient. If they repeat themselves, take time to express themselves, or go quiet — that is okay. Hold space for them.
- Always validate their feelings. Say things like "I hear you", "That makes complete sense", "It's okay to feel that way", "You are safe here".
- Keep your responses short, calm, and focused. Do not overwhelm them with too much at once.
- Gently ask follow-up questions to gather more details about what they are going through — one question at a time, never rapid-fire.
- Listen carefully and acknowledge what they share before asking anything else.
- If they seem distressed, scared, or in pain — slow down even more. Offer comfort first, then gently ask what happened.
- Use warm, simple language. Avoid clinical or formal tone. Speak like a trusted, calm friend.
- Never judge, minimize, or lecture. Your role is to listen, support, and carefully understand their full situation.
- If they share something serious (abuse, danger, trauma), respond with deep empathy and ask follow-up questions with care to understand more.`;

// Prefix markers sent before the AI response so the frontend can detect crisis level
const CRISIS_MARKER_PREFIX = "[[CRISIS:";
const CRISIS_MARKER_SUFFIX = "]]";

chatRouter.post(
  "/",
  zValidator("json", ChatRequestSchema),
  async (c) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({ error: { message: "ANTHROPIC_API_KEY is not configured", code: "missing_api_key" } }, 500);
    }

    const { messages } = c.req.valid("json");
    const user = c.get("user");

    // --- Crisis detection (runs <1ms, pattern matching only) ---
    const crisis = detectCrisis(messages);
    const crisisInjection = getCrisisPromptInjection(crisis.level);

    // --- Build system prompt ---
    let systemPrompt = BASE_SYSTEM_PROMPT;

    // Add emotional memory context if user is logged in
    if (user) {
      try {
        const emotionalContext = await loadEmotionalContext(user.id);
        if (emotionalContext) {
          systemPrompt += "\n" + emotionalContext;
        }
      } catch {
        // If memory loading fails, just use the base prompt
      }
    }

    // Add crisis instructions if detected
    if (crisisInjection) {
      systemPrompt += "\n" + crisisInjection;
    }

    return streamText(c, async (stream) => {
      // Send crisis level marker as the first bytes so the frontend can react immediately
      if (crisis.level !== "none") {
        await stream.write(`${CRISIS_MARKER_PREFIX}${crisis.level}${CRISIS_MARKER_SUFFIX}`);
      }

      const anthropicStream = client.messages.stream({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: systemPrompt,
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

      // Extract emotions in the background after streaming completes
      if (user) {
        extractAndSaveEmotions(user.id, messages).catch(() => {});
      }
    });
  }
);

export { chatRouter };
