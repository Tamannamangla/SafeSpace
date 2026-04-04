import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  ageGroup: z.enum(["under7", "above7"]).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const AnalyzeRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
});

export const IdentifiedIssueSchema = z.object({
  name: z.string(),
  severity: z.number().min(1).max(10),
  description: z.string(),
  category: z.enum(["anxiety", "depression", "trauma", "stress", "relationship", "grief", "anger", "other"]),
});

export const EmotionalPatternSchema = z.object({
  emotion: z.string(),
  percentage: z.number(),
  color: z.string(),
});

export const AnalyzeResponseSchema = z.object({
  patientSummary: z.string(),
  sessionNotes: z.array(z.string()),
  identifiedIssues: z.array(IdentifiedIssueSchema),
  emotionalPatterns: z.array(EmotionalPatternSchema),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  recommendations: z.array(z.string()),
  followUpActions: z.array(z.string()),
  diagnosisInsights: z.string(),
  overallWellbeingScore: z.number().min(1).max(10),
  dimensionScores: z.object({
    anxiety: z.number().min(0).max(10),
    depression: z.number().min(0).max(10),
    stress: z.number().min(0).max(10),
    trauma: z.number().min(0).max(10),
    socialIsolation: z.number().min(0).max(10),
    selfEsteem: z.number().min(0).max(10),
  }),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type IdentifiedIssue = z.infer<typeof IdentifiedIssueSchema>;
export type EmotionalPattern = z.infer<typeof EmotionalPatternSchema>;
