import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../prisma";
import { encrypt, safeDecrypt } from "./encryption";
import { scrubPII } from "./pii-scrubber";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ExtractedEmotion {
  emotion: string;
  trigger: string;
  event: string;
  intensity: number;
}

/**
 * Extracts emotional patterns from recent messages and saves them to the user's memory graph.
 * - PII is scrubbed from event descriptions before storage
 * - Event descriptions are encrypted at rest
 * Runs in the background — never blocks the chat response.
 */
export async function extractAndSaveEmotions(
  userId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY || messages.length < 2) return;

  // Only analyze user messages to extract emotions
  const recentUserMessages = messages
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => m.content)
    .join("\n");

  if (!recentUserMessages.trim()) return;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You extract emotional patterns from therapy/support conversation messages.
Return ONLY a JSON array of emotional entries. Each entry has:
- "emotion": the core emotion (anxiety, sadness, joy, fear, anger, guilt, shame, loneliness, hope, frustration, grief, confusion)
- "trigger": the category/context that triggered it (work, relationship, family, health, finance, school, loss, trauma, self-image, social)
- "event": a brief, ANONYMIZED description of the event/situation (max 50 words). Do NOT include any names, emails, phone numbers, or identifying details. Use generic terms like "a friend", "a family member", "their partner".
- "intensity": 1-10 how strong the emotion appears

If no clear emotions are detected, return an empty array [].
Return ONLY valid JSON, no markdown, no explanation.`,
      messages: [
        {
          role: "user",
          content: `Extract emotional patterns from these messages:\n\n${recentUserMessages}`,
        },
      ],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    const cleaned = rawText.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const emotions: ExtractedEmotion[] = JSON.parse(cleaned);

    if (!Array.isArray(emotions) || emotions.length === 0) return;

    // Save each emotional entry — PII scrubbed + event encrypted
    await prisma.emotionalMemory.createMany({
      data: emotions.slice(0, 5).map((e) => ({
        userId,
        emotion: String(e.emotion).toLowerCase().slice(0, 50),
        trigger: String(e.trigger).toLowerCase().slice(0, 50),
        event: encrypt(scrubPII(String(e.event).slice(0, 200))),
        intensity: Math.min(10, Math.max(1, Math.round(Number(e.intensity) || 5))),
      })),
    });
  } catch {
    // Silent fail — extraction should never break the app
  }
}

/**
 * Loads the user's emotional memory and formats it as context for the system prompt.
 */
export async function loadEmotionalContext(userId: string): Promise<string> {
  const memories = await prisma.emotionalMemory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (memories.length === 0) return "";

  // Build a summary of emotional patterns
  const emotionCounts: Record<string, number> = {};
  const triggerCounts: Record<string, number> = {};
  const recentEvents: string[] = [];

  for (const m of memories) {
    emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
    triggerCounts[m.trigger] = (triggerCounts[m.trigger] || 0) + 1;
    if (recentEvents.length < 5) {
      const decryptedEvent = safeDecrypt(m.event);
      recentEvents.push(`- Felt ${m.emotion} (intensity ${m.intensity}/10) about "${decryptedEvent}" [trigger: ${m.trigger}]`);
    }
  }

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([emotion, count]) => `${emotion} (${count}x)`)
    .join(", ");

  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([trigger, count]) => `${trigger} (${count}x)`)
    .join(", ");

  return `
--- EMOTIONAL MEMORY (from past sessions) ---
This person has shared with you before. Here is what you remember:

Recurring emotions: ${topEmotions}
Common triggers: ${topTriggers}

Recent emotional events:
${recentEvents.join("\n")}

Use this context to show continuity and care. Reference their past experiences naturally when relevant (e.g. "Last time you mentioned..."). Do NOT list these out or make it obvious you are reading from a file. Be natural and empathetic.
--- END MEMORY ---`;
}
