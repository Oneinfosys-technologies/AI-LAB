import { z } from "zod";

export const healthChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string(),
  timestamp: z.date(),
  status: z.enum(["sending", "sent", "delivered", "read"]).optional(),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })
  ).optional(),
});

export const healthChatHistorySchema = z.array(
  z.object({
    role: z.enum(["user", "model"]),
    content: z.string(),
  })
);

export const healthChatRequestSchema = z.object({
  history: healthChatHistorySchema,
  message: z.string(),
  userId: z.number(),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })
  ).optional(),
});

export const healthChatResponseSchema = z.object({
  response: z.string(),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })
  ).optional(),
});

export type HealthChatMessage = z.infer<typeof healthChatMessageSchema>;
export type HealthChatHistory = z.infer<typeof healthChatHistorySchema>;
export type HealthChatRequest = z.infer<typeof healthChatRequestSchema>;
export type HealthChatResponse = z.infer<typeof healthChatResponseSchema>; 