import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import Anthropic from "@anthropic-ai/sdk";
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "../types";

const analyzeRouter = new Hono();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert clinical psychologist conducting a detailed analysis of a therapy/support session. Analyze the provided conversation and return a comprehensive psychological assessment.

Return ONLY valid JSON with no markdown, no explanation, just the JSON object matching this exact structure:

{
  "patientSummary": "string — brief summary of the patient's situation and presentation",
  "sessionNotes": ["array of strings — key clinical observations from the session"],
  "identifiedIssues": [
    {
      "name": "string — name of the psychological issue",
      "severity": "number 1-10",
      "description": "string — clinical description of this issue as observed",
      "category": "one of: anxiety | depression | trauma | stress | relationship | grief | anger | other"
    }
  ],
  "emotionalPatterns": [
    {
      "emotion": "string — emotion name",
      "percentage": "number 0-100 — relative prevalence in session",
      "color": "string — hex color code representing this emotion"
    }
  ],
  "riskLevel": "one of: low | medium | high | critical",
  "recommendations": ["array of strings — therapeutic recommendations"],
  "followUpActions": ["array of strings — specific actions to take in follow-up"],
  "diagnosisInsights": "string — clinical diagnostic insights and differential considerations",
  "overallWellbeingScore": "number 1-10 (10 = excellent wellbeing)",
  "dimensionScores": {
    "anxiety": "number 0-10 (10 = severe anxiety)",
    "depression": "number 0-10 (10 = severe depression)",
    "stress": "number 0-10 (10 = extreme stress)",
    "trauma": "number 0-10 (10 = severe trauma indicators)",
    "socialIsolation": "number 0-10 (10 = complete isolation)",
    "selfEsteem": "number 0-10 (10 = very low self-esteem)"
  }
}

Be thorough, clinically accurate, and compassionate in your analysis. All percentage values in emotionalPatterns should sum to approximately 100.`;

analyzeRouter.post(
  "/",
  zValidator("json", AnalyzeRequestSchema),
  async (c) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json(
        { error: { message: "ANTHROPIC_API_KEY is not configured", code: "missing_api_key" } },
        500
      );
    }

    const { messages } = c.req.valid("json");

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Patient" : "Therapist"}: ${m.content}`)
      .join("\n");

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please analyze the following therapy/support session conversation:\n\n${conversationText}`,
        },
      ],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    // Strip markdown code fences if present (e.g. ```json ... ``` or with leading whitespace)
    const cleanedText = rawText.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      return c.json(
        { error: { message: "Failed to parse AI response as JSON", code: "parse_error" } },
        500
      );
    }

    const validated = AnalyzeResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return c.json(
        { error: { message: "AI response did not match expected schema", code: "schema_mismatch" } },
        500
      );
    }

    return c.json({ data: validated.data });
  }
);

export { analyzeRouter };
