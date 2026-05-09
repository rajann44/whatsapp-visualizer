import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  format,
  getDay,
  getHours,
  startOfDay,
  subDays
} from "date-fns";

import { type ChatMessage, type MessageType, MessageTypeSchema } from "@/lib/whatsapp/types";

export interface AnalyticsFilters {
  participant: string | "all";
  dateFrom?: Date;
  dateTo?: Date;
  messageType: MessageType | "all";
}

export interface AnalyticsResult {
  totalMessages: number;
  participants: string[];
  firstMessageAt?: Date;
  lastMessageAt?: Date;
  activityByDay: Array<{ date: string; count: number }>;
  heatmap: Array<{ weekday: number; hour: number; count: number }>;
  participantComparison: Array<{ participant: string; messages: number; averageLength: number; links: number; attachments: number }>;
  replyTimeByParticipant: Array<{ participant: string; medianMinutes: number | null }>;
  streaks: {
    currentDays: number;
    longestDays: number;
  };
  attachmentCounts: Array<{ type: MessageType; count: number }>;
  topDomains: Array<{ domain: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
  topPhrases: Array<{ phrase: string; count: number }>;
  messageLength: {
    mean: number;
    p50: number;
    p90: number;
  };
  notablePatterns: string[];
}

const stopWords = new Set([
  "the",
  "and",
  "for",
  "you",
  "are",
  "with",
  "that",
  "this",
  "was",
  "have",
  "from",
  "your",
  "but",
  "not",
  "kya",
  "hai",
  "krna",
  "kar",
  "dia",
  "please",
  "will",
  "all",
  "its",
  "can",
  "otp"
]);

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((percentileValue / 100) * (sorted.length - 1));
  return sorted[index];
}

export function filterMessages(messages: ChatMessage[], filters: AnalyticsFilters): ChatMessage[] {
  return messages.filter((message) => {
    if (filters.participant !== "all" && message.sender !== filters.participant) {
      return false;
    }
    if (filters.messageType !== "all" && message.messageType !== filters.messageType) {
      return false;
    }
    if (filters.dateFrom && message.timestamp < startOfDay(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && message.timestamp > endOfDay(filters.dateTo)) {
      return false;
    }
    return true;
  });
}

export function computeAnalytics(messages: ChatMessage[], allParticipants: string[]): AnalyticsResult {
  const sorted = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const lengths = sorted.map((message) => message.content.length);

  const activityMap = new Map<string, number>();
  for (const message of sorted) {
    const day = format(message.timestamp, "yyyy-MM-dd");
    activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
  }

  const heatmapMap = new Map<string, number>();
  for (const message of sorted) {
    const key = `${getDay(message.timestamp)}-${getHours(message.timestamp)}`;
    heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + 1);
  }

  const comparison = allParticipants.map((participant) => {
    const scoped = sorted.filter((message) => message.sender === participant);
    const attachments = scoped.filter((message) =>
      ["media_omitted", "document_omitted", "sticker_omitted", "gif_omitted", "contact_omitted"].includes(message.messageType)
    ).length;
    return {
      participant,
      messages: scoped.length,
      averageLength: scoped.length ? Math.round(scoped.reduce((acc, item) => acc + item.content.length, 0) / scoped.length) : 0,
      links: scoped.filter((message) => message.hasLink).length,
      attachments
    };
  });

  const responseTimesBySender = new Map<string, number[]>();
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    if (current.sender === previous.sender) {
      continue;
    }
    const diff = differenceInMinutes(current.timestamp, previous.timestamp);
    if (diff <= 0 || diff > 24 * 60) {
      continue;
    }
    const existing = responseTimesBySender.get(current.sender) ?? [];
    existing.push(diff);
    responseTimesBySender.set(current.sender, existing);
  }

  const replyTimeByParticipant = allParticipants.map((participant) => {
    const values = responseTimesBySender.get(participant) ?? [];
    return {
      participant,
      medianMinutes: values.length === 0 ? null : percentile(values, 50)
    };
  });

  const uniqueDays = [...new Set(sorted.map((message) => format(message.timestamp, "yyyy-MM-dd")))].sort();
  let longestDays = 0;
  let currentDays = 0;
  let rolling = 0;

  for (let index = 0; index < uniqueDays.length; index += 1) {
    if (index === 0) {
      rolling = 1;
    } else {
      const previous = new Date(uniqueDays[index - 1]);
      const now = new Date(uniqueDays[index]);
      const gap = differenceInMinutes(now, previous) / (60 * 24);
      rolling = gap === 1 ? rolling + 1 : 1;
    }
    longestDays = Math.max(longestDays, rolling);
  }

  if (sorted.length > 0) {
    const lastDay = startOfDay(sorted[sorted.length - 1].timestamp);
    const firstConsidered = subDays(lastDay, 120);
    const interval = eachDayOfInterval({ start: firstConsidered, end: lastDay });
    const activeDays = new Set(uniqueDays);
    for (let i = interval.length - 1; i >= 0; i -= 1) {
      if (activeDays.has(format(interval[i], "yyyy-MM-dd"))) {
        currentDays += 1;
      } else {
        break;
      }
    }
  }

  const attachmentCounts = MessageTypeSchema.options
    .map((type) => ({
      type,
      count: sorted.filter((message) => message.messageType === type).length
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const domainMap = new Map<string, number>();
  sorted.forEach((message) => {
    message.linkDomains.forEach((domain) => {
      domainMap.set(domain, (domainMap.get(domain) ?? 0) + 1);
    });
  });

  const tokenMap = new Map<string, number>();
  const phraseMap = new Map<string, number>();
  sorted.forEach((message) => {
    if (message.messageType !== "text" && message.messageType !== "link") {
      return;
    }
    const tokens = message.normalizedContent.split(" ").filter((token) => token.length >= 3 && !stopWords.has(token));
    tokens.forEach((token) => tokenMap.set(token, (tokenMap.get(token) ?? 0) + 1));
    for (let i = 0; i < tokens.length - 1; i += 1) {
      const phrase = `${tokens[i]} ${tokens[i + 1]}`;
      phraseMap.set(phrase, (phraseMap.get(phrase) ?? 0) + 1);
    }
  });

  const topWords = [...tokenMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));

  const topPhrases = [...phraseMap.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({ phrase, count }));

  const notablePatterns: string[] = [];
  const mostTalkative = [...comparison].sort((a, b) => b.messages - a.messages)[0];
  if (mostTalkative && sorted.length > 0) {
    const share = Math.round((mostTalkative.messages / sorted.length) * 100);
    notablePatterns.push(`${mostTalkative.participant} contributes ${share}% of all messages in this filter.`);
  }

  const fastestReplier = [...replyTimeByParticipant]
    .filter((entry) => entry.medianMinutes !== null)
    .sort((a, b) => (a.medianMinutes ?? Number.POSITIVE_INFINITY) - (b.medianMinutes ?? Number.POSITIVE_INFINITY))[0];
  if (fastestReplier?.medianMinutes !== null) {
    notablePatterns.push(`${fastestReplier.participant} has the fastest median reply time at ${fastestReplier.medianMinutes} minutes.`);
  }

  if (longestDays >= 3) {
    notablePatterns.push(`Longest daily activity streak reaches ${longestDays} consecutive days.`);
  }

  const linkShare = sorted.length ? Math.round((sorted.filter((message) => message.hasLink).length / sorted.length) * 100) : 0;
  if (linkShare >= 20) {
    notablePatterns.push(`Links account for ${linkShare}% of messages, suggesting high information sharing.`);
  }

  return {
    totalMessages: sorted.length,
    participants: allParticipants,
    firstMessageAt: sorted[0]?.timestamp,
    lastMessageAt: sorted.at(-1)?.timestamp,
    activityByDay: [...activityMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count })),
    heatmap: [...heatmapMap.entries()].map(([key, count]) => {
      const [weekday, hour] = key.split("-").map((value) => Number(value));
      return { weekday, hour, count };
    }),
    participantComparison: comparison,
    replyTimeByParticipant,
    streaks: {
      currentDays,
      longestDays
    },
    attachmentCounts,
    topDomains: [...domainMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([domain, count]) => ({ domain, count })),
    topWords,
    topPhrases,
    messageLength: {
      mean: lengths.length ? Math.round(lengths.reduce((acc, value) => acc + value, 0) / lengths.length) : 0,
      p50: percentile(lengths, 50),
      p90: percentile(lengths, 90)
    },
    notablePatterns
  };
}
