import { describe, expect, it } from "vitest";

import { computeAdvancedInsights } from "@/lib/whatsapp/advanced";
import { computeAnalytics } from "@/lib/whatsapp/analytics";
import { type ChatMessage } from "@/lib/whatsapp/types";

function createMessage(id: number, sender: string, at: string, content: string): ChatMessage {
  return {
    id: String(id),
    chatId: "chat",
    chatName: "chat",
    timestamp: new Date(at),
    sender,
    content,
    normalizedContent: content.toLowerCase(),
    messageType: "text",
    hasLink: false,
    linkDomains: [],
    rawLineIndex: id
  };
}

describe("advanced insights", () => {
  it("computes deterministic advanced metrics", () => {
    const messages: ChatMessage[] = [
      createMessage(1, "A", "2024-01-01T10:00:00Z", "Hey?"),
      createMessage(2, "B", "2024-01-01T10:02:00Z", "Hi"),
      createMessage(3, "A", "2024-01-01T10:05:00Z", "How are you?"),
      createMessage(4, "B", "2024-01-01T10:07:00Z", "Good"),
      createMessage(5, "A", "2024-01-05T10:00:00Z", "New session hello"),
      createMessage(6, "B", "2024-01-05T10:08:00Z", "Nice to reconnect"),
      createMessage(7, "A", "2024-02-01T10:00:00Z", "Another month?"),
      createMessage(8, "B", "2024-02-01T10:02:00Z", "yes")
    ];

    const analytics = computeAnalytics(messages, ["A", "B"]);
    const advanced = computeAdvancedInsights(messages, analytics);

    expect(advanced.sessions.records.length).toBeGreaterThan(1);
    expect(["warming", "stable", "cooling"]).toContain(advanced.drift.overall);
    expect(advanced.energy.series.length).toBeGreaterThan(0);
    expect(advanced.reciprocity.mode).toBe("one_to_one");
    expect(advanced.topicDrift.monthlyKeywords.length).toBeGreaterThan(0);
  });
});
