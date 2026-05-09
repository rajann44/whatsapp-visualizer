import { ParseResultSchema, type ChatMessage, type MessageType, type ParseResult } from "@/lib/whatsapp/types";

interface SampleSeed {
  at: string;
  sender: string;
  content: string;
  messageType: MessageType;
}

const chatName = "sample-chat.txt";
const chatId = "sample-chat";

const sampleSeeds: SampleSeed[] = [
  { at: "2026-01-03T09:05:00", sender: "Aarav", content: "Morning! Did you review the travel ideas?", messageType: "text" },
  { at: "2026-01-03T09:11:00", sender: "Mira", content: "Yes, loved the hill route. Lets shortlist options tonight.", messageType: "text" },
  { at: "2026-01-03T21:02:00", sender: "Aarav", content: "Sharing one: https://example.com/trail-guide", messageType: "link" },
  { at: "2026-01-04T21:18:00", sender: "Mira", content: "Perfect, adding it to notes.", messageType: "text" },
  { at: "2026-01-08T08:48:00", sender: "Mira", content: "[Image omitted] Sunrise from last trip", messageType: "media_omitted" },
  { at: "2026-01-08T09:01:00", sender: "Aarav", content: "That view is unreal.", messageType: "text" },
  { at: "2026-01-10T22:14:00", sender: "Aarav", content: "Can we lock dates this week?", messageType: "text" },
  { at: "2026-01-10T22:40:00", sender: "Mira", content: "Saturday works. I will call you tomorrow.", messageType: "text" },
  { at: "2026-01-12T20:05:00", sender: "Mira", content: "Voice call", messageType: "voice_call" },
  { at: "2026-01-16T19:42:00", sender: "Aarav", content: "Booked tickets. Sending PDF in mail.", messageType: "text" },
  { at: "2026-01-16T20:13:00", sender: "Mira", content: "Great. Lets plan gear too.", messageType: "text" },
  { at: "2026-01-20T08:25:00", sender: "Aarav", content: "Do we need jackets or only layers?", messageType: "text" },
  { at: "2026-01-20T08:36:00", sender: "Mira", content: "Layers and one shell. Weather swings fast.", messageType: "text" },
  { at: "2026-01-24T23:06:00", sender: "Mira", content: "Running late today. Can we continue tomorrow?", messageType: "text" },
  { at: "2026-01-25T07:51:00", sender: "Aarav", content: "Sure, no rush.", messageType: "text" },
  { at: "2026-01-31T18:20:00", sender: "Aarav", content: "Route draft v2 is ready.", messageType: "text" },
  { at: "2026-01-31T18:41:00", sender: "Mira", content: "Looks better than v1 for sure.", messageType: "text" },
  { at: "2026-02-03T09:09:00", sender: "Mira", content: "Reminder: carry ID copies.", messageType: "text" },
  { at: "2026-02-03T09:28:00", sender: "Aarav", content: "Noted. Also check this list https://example.org/checklist", messageType: "link" },
  { at: "2026-02-07T22:15:00", sender: "Mira", content: "I am packing tonight. Final headcount still 2?", messageType: "text" },
  { at: "2026-02-07T22:37:00", sender: "Aarav", content: "Yes, still 2. Leaving at 6 AM.", messageType: "text" },
  { at: "2026-02-15T20:11:00", sender: "Aarav", content: "Back home. That was worth it.", messageType: "text" },
  { at: "2026-02-15T20:16:00", sender: "Mira", content: "Best part was the ridge sunrise.", messageType: "text" },
  { at: "2026-02-22T21:04:00", sender: "Mira", content: "Should we plan a shorter trip in March?", messageType: "text" },
  { at: "2026-02-22T21:29:00", sender: "Aarav", content: "Yes. Maybe coastal this time.", messageType: "text" },
  { at: "2026-03-02T08:58:00", sender: "Aarav", content: "Found two places. Need your vote.", messageType: "text" },
  { at: "2026-03-02T09:04:00", sender: "Mira", content: "Send both links.", messageType: "text" },
  { at: "2026-03-02T09:10:00", sender: "Aarav", content: "https://example.net/a and https://example.net/b", messageType: "link" },
  { at: "2026-03-05T23:02:00", sender: "Mira", content: "Lets pick A. Better timings.", messageType: "text" },
  { at: "2026-03-08T11:12:00", sender: "Aarav", content: "Done. Hotel confirmed.", messageType: "text" }
];

function toNormalizedContent(content: string): string {
  return content
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toChatMessage(seed: SampleSeed, index: number): ChatMessage {
  const hasLink = /https?:\/\//i.test(seed.content);
  const linkDomains = hasLink
    ? (seed.content.match(/https?:\/\/[^\s]+/gi) ?? []).map((url) => new URL(url).hostname.replace(/^www\./, ""))
    : [];

  return {
    id: `${chatId}-${index}`,
    chatId,
    chatName,
    timestamp: new Date(seed.at),
    sender: seed.sender,
    content: seed.content,
    normalizedContent: toNormalizedContent(seed.content),
    messageType: seed.messageType,
    hasLink,
    linkDomains,
    rawLineIndex: index
  };
}

export function buildSampleParseResult(): ParseResult {
  const messages = sampleSeeds.map(toChatMessage);
  const participants = [...new Set(messages.map((message) => message.sender))].sort((a, b) => a.localeCompare(b));

  return ParseResultSchema.parse({
    files: [
      {
        id: "sample-file-1",
        name: chatName,
        messages,
        participants,
        parseWarnings: []
      }
    ],
    allMessages: messages,
    participants,
    parseWarnings: [],
    sessionMode: "sample",
    parseStats: {
      totalFiles: 1,
      parsedFiles: 1,
      totalMessages: messages.length
    }
  });
}
