import { describe, expect, it } from "vitest";

import { computeAnalytics, filterMessages } from "@/lib/whatsapp/analytics";
import { type ChatMessage } from "@/lib/whatsapp/types";

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    chatId: "chat",
    chatName: "chat",
    timestamp: new Date("2024-01-01T09:00:00.000Z"),
    sender: "A",
    content: "hello world",
    normalizedContent: "hello world",
    messageType: "text",
    hasLink: false,
    linkDomains: [],
    rawLineIndex: 1
  },
  {
    id: "2",
    chatId: "chat",
    chatName: "chat",
    timestamp: new Date("2024-01-01T09:05:00.000Z"),
    sender: "B",
    content: "https://example.com",
    normalizedContent: "",
    messageType: "link",
    hasLink: true,
    linkDomains: ["example.com"],
    rawLineIndex: 2
  },
  {
    id: "3",
    chatId: "chat",
    chatName: "chat",
    timestamp: new Date("2024-01-02T09:10:00.000Z"),
    sender: "A",
    content: "image omitted",
    normalizedContent: "image omitted",
    messageType: "media_omitted",
    hasLink: false,
    linkDomains: [],
    rawLineIndex: 3
  }
];

describe("analytics", () => {
  it("filters messages correctly", () => {
    const result = filterMessages(mockMessages, {
      participant: "A",
      messageType: "all"
    });
    expect(result).toHaveLength(2);
  });

  it("computes key analytics safely", () => {
    const analytics = computeAnalytics(mockMessages, ["A", "B"]);

    expect(analytics.totalMessages).toBe(3);
    expect(analytics.topDomains[0].domain).toBe("example.com");
    expect(analytics.streaks.longestDays).toBe(2);
    expect(analytics.participantComparison.find((entry) => entry.participant === "A")?.messages).toBe(2);
  });
});
