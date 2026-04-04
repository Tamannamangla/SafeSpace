/**
 * PII scrubber — strips personally identifiable information from text
 * before storing in emotional memory graph.
 *
 * Removes: email addresses, phone numbers, full names (proper nouns
 * near identity keywords), social security numbers, and URLs.
 */

// Email addresses
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Phone numbers (various formats)
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

// SSN / national ID patterns
const SSN_RE = /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g;

// URLs
const URL_RE = /https?:\/\/[^\s]+/g;

// Names near identity keywords (e.g. "my name is John Smith", "I'm Sarah")
const NAME_INTRO_RE = /(?:(?:my name is|i'?m|i am|call me|they call me)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;

// Standalone proper names at sentence start followed by said/told/asked
const NAME_CONTEXT_RE = /\b([A-Z][a-z]{2,})\s+(?:said|told|asked|called|texted|emailed|messaged)\b/g;

/**
 * Scrubs PII from text, replacing with generic placeholders.
 */
export function scrubPII(text: string): string {
  let cleaned = text;

  // Replace names introduced with identity keywords
  cleaned = cleaned.replace(NAME_INTRO_RE, (match, _name) => {
    return match.replace(_name, "[person]");
  });

  // Replace names in context
  cleaned = cleaned.replace(NAME_CONTEXT_RE, (match, name) => {
    return match.replace(name, "[person]");
  });

  // Replace emails
  cleaned = cleaned.replace(EMAIL_RE, "[email]");

  // Replace phone numbers
  cleaned = cleaned.replace(PHONE_RE, "[phone]");

  // Replace SSNs
  cleaned = cleaned.replace(SSN_RE, "[id-number]");

  // Replace URLs
  cleaned = cleaned.replace(URL_RE, "[url]");

  return cleaned;
}
