import { z } from "zod";

export const MessageTypeSchema = z.enum([
  "text",
  "system",
  "media_omitted",
  "document_omitted",
  "sticker_omitted",
  "gif_omitted",
  "contact_omitted",
  "voice_call",
  "video_call",
  "missed_call",
  "location",
  "link",
  "deleted",
  "other"
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  chatName: z.string(),
  timestamp: z.date(),
  sender: z.string(),
  content: z.string(),
  normalizedContent: z.string(),
  messageType: MessageTypeSchema,
  hasLink: z.boolean(),
  linkDomains: z.array(z.string()),
  rawLineIndex: z.number().int().nonnegative()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ParsedChatFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  messages: z.array(ChatMessageSchema),
  participants: z.array(z.string()),
  parseWarnings: z.array(z.string())
});

export type ParsedChatFile = z.infer<typeof ParsedChatFileSchema>;

export const ParseResultSchema = z.object({
  files: z.array(ParsedChatFileSchema),
  allMessages: z.array(ChatMessageSchema),
  participants: z.array(z.string()),
  parseWarnings: z.array(z.string()),
  sessionMode: z.enum(["uploaded", "sample"]).optional(),
  parseStats: z.object({
    totalFiles: z.number().int().nonnegative(),
    parsedFiles: z.number().int().nonnegative(),
    totalMessages: z.number().int().nonnegative()
  })
});

export type ParseResult = z.infer<typeof ParseResultSchema>;

export interface UploadProgress {
  state: "idle" | "loading" | "parsed" | "error";
  message?: string;
}
