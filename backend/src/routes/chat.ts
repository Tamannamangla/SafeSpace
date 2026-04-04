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

const CHILD_SYSTEM_PROMPT = `You are a very friendly, warm, and fun companion for a little child (under 7 years old). Your name is Buddy the Bear. The child you are talking to may be a victim of something difficult — be extra gentle, caring, and protective.

Rules you must ALWAYS follow:
- Use VERY simple words. Short sentences. Easy to understand for a small child.
- Be super warm, kind, and encouraging. Like a gentle, loving teddy bear friend.
- Use emojis in your responses to make them fun and friendly (but not too many).
- Keep responses SHORT — 1 to 3 sentences maximum. Little kids can't read long messages.
- If the child seems sad or scared, comfort them first. Say things like "It's okay! I'm here with you!" or "You are so brave for telling me!"
- NEVER use big or scary words. Keep everything simple and safe.
- Ask ONE simple question at a time. Like "What happened?" or "How do you feel?"
- Be playful when appropriate but always sensitive to their emotions.
- If they share something serious, be very gentle and reassuring. Say "That's not your fault" and "You did the right thing by talking to me."
- Speak like a friendly cartoon character — warm, simple, and caring.`;

const TEEN_SYSTEM_PROMPT = `You are a supportive, understanding companion for a young person (8-18 years old). Your name is Buddy. The person you're talking to may be going through something difficult — be caring, relatable, and respectful of their maturity.

Rules you must always follow:
- Use clear, simple language but DON'T talk down to them. They're not little kids.
- Be warm and genuine — like a trusted older friend or mentor.
- Use some emojis naturally but don't overdo it. Keep it real.
- Keep responses moderate length — 2-4 sentences usually. Not too short, not overwhelming.
- Validate their feelings: "That sounds really tough", "It makes sense you'd feel that way", "You're not alone in this".
- Be patient and let them share at their own pace. Don't rush or push.
- Ask thoughtful follow-up questions — one at a time.
- If they share something serious (abuse, bullying, self-harm, danger), respond with deep empathy. Say "That's not okay and it's not your fault" and gently ask more to understand.
- Never judge, lecture, or minimize what they're going through.
- Acknowledge that being a young person can be really hard — school, friends, family, growing up.
- If appropriate, gently remind them that trusted adults (teacher, school counselor, family member) can help too.
- Speak like a caring friend who truly gets it — not a therapist or a parent.`;

const CRISIS_MARKER_PREFIX = "[[CRISIS:";
const CRISIS_MARKER_SUFFIX = "]]";

chatRouter.post(
  "/",
  zValidator("json", ChatRequestSchema),
  async (c) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({ error: { message: "ANTHROPIC_API_KEY is not configured", code: "missing_api_key" } }, 500);
    }

    const { messages, ageGroup } = c.req.valid("json");
    const user = c.get("user");

    // --- Crisis detection (runs <1ms, pattern matching only) ---
    const crisis = detectCrisis(messages);
    const crisisInjection = getCrisisPromptInjection(crisis.level);

    // --- Build system prompt ---
    let systemPrompt = ageGroup === "under7"
      ? CHILD_SYSTEM_PROMPT
      : ageGroup === "8to18"
        ? TEEN_SYSTEM_PROMPT
        : BASE_SYSTEM_PROMPT;

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
