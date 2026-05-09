import { format } from "date-fns";

import { type TopicDriftSummary } from "@/lib/whatsapp/advanced/types";
import { bucketByMonth } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

function topCounts(items: string[], limit = 6): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  items.forEach((item) => {
    map.set(item, (map.get(item) ?? 0) + 1);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function monthItems(messages: ChatMessage[], extractor: (message: ChatMessage) => string[]): Array<{ month: string; items: Array<{ label: string; count: number }> }> {
  const monthMap = bucketByMonth(messages);
  return [...monthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, bucket]) => ({
      month: format(new Date(`${month}-01`), "MMM yy"),
      items: topCounts(bucket.flatMap((message) => extractor(message)))
    }));
}

export function computeTopicDrift(messages: ChatMessage[], topPhrases: Array<{ phrase: string; count: number }>): TopicDriftSummary {
  const monthlyKeywords = monthItems(messages, (message) => message.normalizedContent.split(" ").filter((token) => token.length >= 4));
  const monthlyDomains = monthItems(messages, (message) => message.linkDomains);
  const monthlyEmojiGroups = monthItems(messages, (message) => message.content.match(/\p{Extended_Pictographic}/gu) ?? []);
  const monthlyAttachmentTypes = monthItems(messages, (message) =>
    ["media_omitted", "document_omitted", "sticker_omitted", "gif_omitted", "contact_omitted"].includes(message.messageType)
      ? [message.messageType.replace(/_/g, " ")]
      : []
  );

  const earliest = monthlyKeywords[0]?.items.map((item) => item.label) ?? [];
  const latest = monthlyKeywords.at(-1)?.items.map((item) => item.label) ?? [];
  const emergingTopics = latest.filter((topic) => !earliest.includes(topic)).slice(0, 6);
  const disappearingTopics = earliest.filter((topic) => !latest.includes(topic)).slice(0, 6);
  const stableTopics = latest.filter((topic) => earliest.includes(topic)).slice(0, 6);

  return {
    monthlyKeywords,
    monthlyDomains,
    monthlyEmojiGroups,
    monthlyAttachmentTypes,
    recurringPhrases: topPhrases.slice(0, 12),
    emergingTopics,
    disappearingTopics,
    stableTopics
  };
}
