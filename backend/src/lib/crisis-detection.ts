/**
 * Crisis detection module.
 * Uses fast pattern matching to identify self-harm risk, crisis language,
 * and severe distress. No AI call — runs in <1ms.
 */

export type CrisisLevel = "none" | "concern" | "high" | "critical";

export interface CrisisResult {
  level: CrisisLevel;
  matched: string[];   // which patterns triggered
}

// Critical — immediate danger / active suicidal ideation
const CRITICAL_PATTERNS = [
  /\b(want|going|plan(?:ning)?|trying|about|ready|decided?)\s+to\s+(kill|end|hurt)\s+(myself|my\s*life|it\s*all|everything)\b/i,
  /\b(kill|end)\s+(myself|my\s*life)\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist|be\s+here)\b/i,
  /\bending\s+(my|this)\s+life\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on|be\s+alive)\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bi'?m\s+going\s+to\s+(jump|hang|overdose|cut|shoot)\b/i,
  /\bwrote\s+a?\s*(suicide)?\s*note\b/i,
  /\bsay\s+goodbye\s+to\s+everyone\b/i,
  /\bend\s+it\s+all\b/i,
];

// High risk — self-harm, severe hopelessness
const HIGH_PATTERNS = [
  /\bself[\s-]*harm(?:ing|ed)?\b/i,
  /\bcut(?:ting)?\s+(myself|my\s*(wrist|arm|body|skin))\b/i,
  /\bhurt(?:ing)?\s+myself\b/i,
  /\bcan'?t\s+(go|keep|carry)\s+on\b/i,
  /\bgive\s+up\s+on\s+(life|everything|living)\b/i,
  /\bnot\s+worth\s+(living|it|anything)\b/i,
  /\bnobody\s+(would|will)\s+(care|miss|notice)\s+(if\s+i)\b/i,
  /\beveryone\s+(would\s+be|is)\s+better\s+off\s+without\s+me\b/i,
  /\blife\s+is\s+(pointless|meaningless|not\s+worth)\b/i,
  /\bi\s+can'?t\s+take\s+(it|this)\s+anymore\b/i,
  /\bwant\s+(this|the)\s+pain\s+to\s+(stop|end)\b/i,
  /\boverdos(?:e|ing)\b/i,
];

// Concern — severe distress signals
const CONCERN_PATTERNS = [
  /\b(feel(?:ing)?|am|i'?m)\s+(so\s+)?(hopeless|helpless|worthless|empty|numb|broken|trapped)\b/i,
  /\bno\s+one\s+(cares|understands|loves)\b/i,
  /\bcompletely\s+alone\b/i,
  /\bwhat'?s\s+the\s+point\b/i,
  /\bi'?m\s+a\s+burden\b/i,
  /\bnot\s+gonna\s+make\s+it\b/i,
  /\bcan'?t\s+(breathe|think|function|cope)\b/i,
  /\b(panic|anxiety)\s+attack\b/i,
  /\bcan'?t\s+stop\s+crying\b/i,
  /\babuse|abusing|abused\s+me\b/i,
  /\bdomestic\s+violence\b/i,
];

function matchPatterns(text: string, patterns: RegExp[]): string[] {
  const matched: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) matched.push(m[0]);
  }
  return matched;
}

/**
 * Scans the latest user message(s) for crisis signals.
 * Returns the highest detected level + matched phrases.
 */
export function detectCrisis(messages: Array<{ role: string; content: string }>): CrisisResult {
  // Check the last 3 user messages (most recent first)
  const userTexts = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  if (!userTexts) return { level: "none", matched: [] };

  const criticalMatches = matchPatterns(userTexts, CRITICAL_PATTERNS);
  if (criticalMatches.length > 0) {
    return { level: "critical", matched: criticalMatches };
  }

  const highMatches = matchPatterns(userTexts, HIGH_PATTERNS);
  if (highMatches.length > 0) {
    return { level: "high", matched: highMatches };
  }

  const concernMatches = matchPatterns(userTexts, CONCERN_PATTERNS);
  if (concernMatches.length > 0) {
    return { level: "concern", matched: concernMatches };
  }

  return { level: "none", matched: [] };
}

/**
 * Returns crisis-specific instructions to inject into the system prompt.
 */
export function getCrisisPromptInjection(level: CrisisLevel): string {
  if (level === "critical") {
    return `
--- CRISIS ALERT: CRITICAL ---
The person has expressed active suicidal ideation or intent to self-harm.

YOUR IMMEDIATE RESPONSE MUST:
1. Acknowledge their pain directly and without judgment: "I hear you, and I'm really glad you told me."
2. Ask if they are safe right now.
3. Gently but clearly share these resources:
   - National Suicide Prevention Lifeline: 988 (call or text, available 24/7)
   - Crisis Text Line: Text HOME to 741741
   - International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
4. Encourage them to reach out to someone they trust — a friend, family member, or professional.
5. Stay calm, warm, and present. Do not lecture. Do not minimize. Do not say "things will get better" — instead say "You don't have to face this alone."
6. Do NOT end the conversation. Keep talking. Your presence matters.
--- END CRISIS ALERT ---`;
  }

  if (level === "high") {
    return `
--- CRISIS ALERT: HIGH RISK ---
The person has mentioned self-harm or expressed severe hopelessness.

YOUR RESPONSE MUST:
1. Take their words seriously. Validate what they are feeling.
2. Gently ask if they are safe and if they have hurt themselves.
3. Share support resources naturally within your response:
   - 988 Suicide & Crisis Lifeline (call or text 988)
   - Crisis Text Line: Text HOME to 741741
4. Encourage professional support — "Talking to someone trained in this can make a real difference."
5. Be extra gentle, patient, and present.
--- END CRISIS ALERT ---`;
  }

  if (level === "concern") {
    return `
--- ELEVATED CONCERN ---
The person is showing signs of severe distress (hopelessness, feeling trapped, panic).

YOUR RESPONSE SHOULD:
1. Validate their feelings deeply — they need to feel heard.
2. Gently check in: "That sounds really overwhelming. Are you safe right now?"
3. If appropriate, mention that support is available: "If you ever feel like things are too much, you can always reach out to 988 — they're there 24/7."
4. Be extra careful not to rush or push.
--- END CONCERN ---`;
  }

  return "";
}
