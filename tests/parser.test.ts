import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseWhatsAppText } from "@/lib/whatsapp/parser";

describe("parseWhatsAppText", () => {
  it("parses multiline messages and omitted media", () => {
    const fixture = readFileSync(join(process.cwd(), "_chat.txt"), "utf8");
    const result = parseWhatsAppText("chat.txt", fixture);

    expect(result.messages.length).toBeGreaterThan(100);
    expect(result.participants).toContain("rajan");
    expect(result.participants).toContain("Paa");

    const multiline = result.messages.find((message) => message.content.includes("Dal Makhani"));
    expect(multiline).toBeDefined();
    expect(multiline?.content.includes("3 butter naan")).toBe(true);

    const media = result.messages.find((message) => message.content.toLowerCase().includes("image omitted"));
    expect(media?.messageType).toBe("media_omitted");

    const call = result.messages.find((message) => message.content.toLowerCase().includes("voice call"));
    expect(call?.messageType).toBe("voice_call");
  });

  it("handles mixed date/time formats", () => {
    const raw = [
      "[01.11.20, 15:18:03] A: hello",
      "12/31/2021, 11:58 PM - B: happy new year",
      "[2024-05-14, 16:55:00] A: Voice call"
    ].join("\n");
    const result = parseWhatsAppText("mixed.txt", raw);

    expect(result.messages).toHaveLength(3);
    expect(result.messages[1].sender).toBe("B");
  });
});
