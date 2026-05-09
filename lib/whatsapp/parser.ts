import { parse, parseISO } from "date-fns";
import JSZip from "jszip";

import { isValidHttpUrl } from "@/lib/utils";
import { ChatMessageSchema, ParsedChatFileSchema, ParseResultSchema, type ChatMessage, type MessageType, type ParseResult } from "@/lib/whatsapp/types";

const invisiblePrefixRegex = /^[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]+/;
const invisibleCharsRegex = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const messageStartPatterns: RegExp[] = [
  /^\[?\u200E?(?:\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2}),\s\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?\]?\s[-–]?\s?/,
  /^(?:\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2}),\s\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?\s[-–]\s/
];

const dateFormats = [
  "dd.MM.yy, HH:mm:ss",
  "dd.MM.yy, HH:mm",
  "dd.MM.yyyy, HH:mm:ss",
  "dd.MM.yyyy, HH:mm",
  "MM/dd/yy, HH:mm:ss",
  "MM/dd/yy, HH:mm",
  "MM/dd/yyyy, HH:mm:ss",
  "MM/dd/yyyy, HH:mm",
  "M/d/yy, h:mm:ss a",
  "M/d/yy, h:mm a",
  "M/d/yyyy, h:mm:ss a",
  "M/d/yyyy, h:mm a",
  "dd/MM/yy, HH:mm:ss",
  "dd/MM/yy, HH:mm",
  "dd/MM/yyyy, HH:mm:ss",
  "dd/MM/yyyy, HH:mm",
  "yyyy-MM-dd, HH:mm:ss",
  "yyyy-MM-dd, HH:mm"
];

interface TokenizedLine {
  timestampRaw: string;
  sender: string;
  body: string;
  startLine: number;
}

function normalizeLine(raw: string): string {
  return raw.replace(invisiblePrefixRegex, "").replace(invisibleCharsRegex, "").replace(/\r/g, "");
}

function isMessageStart(line: string): boolean {
  return messageStartPatterns.some((pattern) => pattern.test(line));
}

function parseMessageStart(line: string): Omit<TokenizedLine, "startLine"> | null {
  const clean = normalizeLine(line.trim());
  const bracketMatch = clean.match(/^\[([^\]]+)\]\s([^:]+):\s?(.*)$/);
  if (bracketMatch) {
    return {
      timestampRaw: bracketMatch[1],
      sender: bracketMatch[2].trim(),
      body: bracketMatch[3] ?? ""
    };
  }

  const bracketSystemMatch = clean.match(/^\[([^\]]+)\]\s(.*)$/);
  if (bracketSystemMatch) {
    return {
      timestampRaw: bracketSystemMatch[1],
      sender: "system",
      body: bracketSystemMatch[2] ?? ""
    };
  }

  const dashMatch = clean.match(/^([^\-]+?)\s[-–]\s([^:]+):\s?(.*)$/);
  if (dashMatch) {
    return {
      timestampRaw: dashMatch[1].trim(),
      sender: dashMatch[2].trim(),
      body: dashMatch[3] ?? ""
    };
  }

  const dashSystemMatch = clean.match(/^([^\-]+?)\s[-–]\s(.*)$/);
  if (dashSystemMatch) {
    return {
      timestampRaw: dashSystemMatch[1].trim(),
      sender: "system",
      body: dashSystemMatch[2] ?? ""
    };
  }

  return null;
}

function parseTimestamp(raw: string): Date | null {
  const trimmed = raw.trim();

  const isoCandidate = parseISO(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    return isoCandidate;
  }

  for (const format of dateFormats) {
    const value = parse(trimmed, format, new Date());
    if (!Number.isNaN(value.getTime())) {
      return value;
    }
  }

  return null;
}

function extractDomains(content: string): string[] {
  const matches = content.match(/https?:\/\/[^\s]+/gi) ?? [];
  const domains = new Set<string>();
  for (const match of matches) {
    if (!isValidHttpUrl(match)) {
      continue;
    }
    domains.add(new URL(match).hostname.replace(/^www\./, ""));
  }
  return [...domains];
}

function inferType(content: string, sender: string): MessageType {
  const normalized = content.toLowerCase();
  const senderNormalized = sender.toLowerCase();
  if (normalized.includes("image omitted") || normalized.includes("video omitted") || normalized.includes("audio omitted")) {
    return "media_omitted";
  }
  if (normalized.includes("document omitted")) {
    return "document_omitted";
  }
  if (normalized.includes("sticker omitted")) {
    return "sticker_omitted";
  }
  if (normalized.includes("gif omitted")) {
    return "gif_omitted";
  }
  if (normalized.includes("contact card omitted")) {
    return "contact_omitted";
  }
  if (normalized.includes("voice call")) {
    return "voice_call";
  }
  if (normalized.includes("video call")) {
    return "video_call";
  }
  if (normalized.includes("missed voice call") || normalized.includes("missed video call")) {
    return "missed_call";
  }
  if (normalized.includes("location omitted")) {
    return "location";
  }
  if (normalized.includes("message deleted") || normalized.includes("this message was deleted")) {
    return "deleted";
  }
  if (normalized.includes("security code") || senderNormalized.includes("system") || senderNormalized.includes("whatsapp")) {
    return "system";
  }
  if (normalized.includes("messages and calls are end-to-end encrypted")) {
    return "system";
  }
  if ((content.match(/https?:\/\//g) ?? []).length > 0) {
    return "link";
  }
  if (normalized.trim().length === 0) {
    return "other";
  }
  return "text";
}

function tokenize(lines: string[]): TokenizedLine[] {
  const messages: TokenizedLine[] = [];
  let current: TokenizedLine | null = null;

  lines.forEach((line, index) => {
    if (isMessageStart(line)) {
      if (current) {
        messages.push(current);
      }

      const parsed = parseMessageStart(line);
      if (parsed) {
        current = {
          ...parsed,
          startLine: index
        };
      } else {
        current = {
          timestampRaw: "",
          sender: "unknown",
          body: normalizeLine(line),
          startLine: index
        };
      }
      return;
    }

    if (!current) {
      return;
    }

    current.body += `\n${line}`;
  });

  if (current) {
    messages.push(current);
  }

  return messages;
}

export function parseWhatsAppText(chatName: string, text: string): { messages: ChatMessage[]; participants: string[]; warnings: string[] } {
  const lines = text.split(/\n/);
  const tokenized = tokenize(lines);
  const warnings: string[] = [];
  const participants = new Set<string>();

  const messages = tokenized
    .map((entry, index): ChatMessage | null => {
      const timestamp = parseTimestamp(entry.timestampRaw);
      if (!timestamp) {
        warnings.push(`Skipping line ${entry.startLine + 1}: invalid timestamp \"${entry.timestampRaw}\"`);
        return null;
      }

      const sender = entry.sender.trim() || "unknown";
      participants.add(sender);
      const content = normalizeLine(entry.body);
      const linkDomains = extractDomains(content);
      const messageType = inferType(content, sender);
      const normalizedContent = content
        .replace(/https?:\/\/[^\s]+/gi, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      return ChatMessageSchema.parse({
        id: `${chatName}-${index}-${timestamp.getTime()}`,
        chatId: chatName,
        chatName,
        timestamp,
        sender,
        content,
        normalizedContent,
        messageType,
        hasLink: linkDomains.length > 0,
        linkDomains,
        rawLineIndex: entry.startLine
      });
    })
    .filter((message): message is ChatMessage => Boolean(message));

  return {
    messages,
    participants: [...participants].sort((a, b) => a.localeCompare(b)),
    warnings
  };
}

export async function parseWhatsAppZip(file: File): Promise<ParseResult> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error("This file is not a valid ZIP archive.");
  }

  const txtEntries = Object.values(zip.files).filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith(".txt"));

  if (txtEntries.length === 0) {
    throw new Error("No .txt chat files found in the ZIP.");
  }

  const parsedFiles = await Promise.all(
    txtEntries.map(async (entry, index) => {
      const text = await entry.async("text");
      const chatName = entry.name.split("/").at(-1) ?? `chat-${index + 1}.txt`;
      const result = parseWhatsAppText(chatName, text);

      return ParsedChatFileSchema.parse({
        id: `${index}-${chatName}`,
        name: chatName,
        messages: result.messages,
        participants: result.participants,
        parseWarnings: result.warnings
      });
    })
  );

  const allMessages = parsedFiles
    .flatMap((fileData) => fileData.messages)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const participants = [...new Set(allMessages.map((message) => message.sender))].sort((a, b) => a.localeCompare(b));
  const parseWarnings = parsedFiles.flatMap((chat) => chat.parseWarnings.map((warning) => `${chat.name}: ${warning}`));

  if (allMessages.length === 0) {
    throw new Error("No chat messages were detected in the export.");
  }

  return ParseResultSchema.parse({
    files: parsedFiles,
    allMessages,
    participants,
    parseWarnings,
    sessionMode: "uploaded",
    parseStats: {
      totalFiles: txtEntries.length,
      parsedFiles: parsedFiles.length,
      totalMessages: allMessages.length
    }
  });
}
