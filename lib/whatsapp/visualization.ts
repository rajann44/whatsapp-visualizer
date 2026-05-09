import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";

import { type AnalyticsResult } from "@/lib/whatsapp/analytics";
import { type ChatMessage } from "@/lib/whatsapp/types";

export interface OverviewMetric {
  label: string;
  value: string;
  insight?: string;
  trend?: Array<{ x: string; y: number }>;
}

export interface VisualizationViewModel {
  overview: OverviewMetric[];
  dailyTrend: Array<{ date: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
  hourOfDay: Array<{ hour: string; count: number }>;
  weekdayHour: Array<{ weekday: number; hour: number; count: number }>;
  participantMessages: Array<{ participant: string; messages: number }>;
  conversationStarters: Array<{ participant: string; count: number }>;
  replyTimes: Array<{ participant: string; minutes: number }>;
  messageLengths: Array<{ participant: string; chars: number }>;
  reciprocity: Array<{ participant: string; share: number }>;
  emojiUsage: Array<{ emoji: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
  topDomains: Array<{ domain: string; count: number }>;
  attachmentComposition: Array<{ label: string; count: number }>;
  streaks: { current: number; longest: number };
  burstDays: Array<{ date: string; count: number }>;
  engagementDelta: number;
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function computeConversationStarters(messages: ChatMessage[]): Map<string, number> {
  const starters = new Map<string, number>();
  if (messages.length === 0) {
    return starters;
  }
  const sorted = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  starters.set(sorted[0].sender, 1);
  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = sorted[index - 1];
    const gapMinutes = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60);
    if (gapMinutes >= 60) {
      starters.set(current.sender, (starters.get(current.sender) ?? 0) + 1);
    }
  }
  return starters;
}

function computeEmojiUsage(messages: ChatMessage[]): Array<{ emoji: string; count: number }> {
  const map = new Map<string, number>();
  for (const message of messages) {
    const matches = message.content.match(/\p{Extended_Pictographic}/gu) ?? [];
    for (const emoji of matches) {
      map.set(emoji, (map.get(emoji) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([emoji, count]) => ({ emoji, count }));
}

export function buildVisualizationViewModel(analytics: AnalyticsResult, filteredMessages: ChatMessage[]): VisualizationViewModel {
  const totalMessages = analytics.totalMessages;
  const activeDays = analytics.activityByDay.length;
  const rangeDays = analytics.firstMessageAt && analytics.lastMessageAt
    ? Math.max(differenceInCalendarDays(analytics.lastMessageAt, analytics.firstMessageAt) + 1, 1)
    : 1;

  const overviewTrend = analytics.activityByDay.slice(-30).map((entry) => ({ x: entry.date.slice(5), y: entry.count }));
  const medianReply = median(
    analytics.replyTimeByParticipant
      .map((entry) => entry.medianMinutes)
      .filter((value): value is number => typeof value === "number")
  );

  const monthMap = new Map<string, number>();
  analytics.activityByDay.forEach((entry) => {
    const month = format(parseISO(entry.date), "MMM yy");
    monthMap.set(month, (monthMap.get(month) ?? 0) + entry.count);
  });

  const hourMap = new Map<number, number>();
  analytics.heatmap.forEach((entry) => {
    hourMap.set(entry.hour, (hourMap.get(entry.hour) ?? 0) + entry.count);
  });

  const starters = computeConversationStarters(filteredMessages);
  const conversationStarters = [...starters.entries()]
    .map(([participant, count]) => ({ participant, count }))
    .sort((a, b) => b.count - a.count);

  const replyTimes = analytics.replyTimeByParticipant
    .filter((entry): entry is { participant: string; medianMinutes: number } => entry.medianMinutes !== null)
    .map((entry) => ({ participant: entry.participant, minutes: entry.medianMinutes }))
    .sort((a, b) => a.minutes - b.minutes);

  const messageLengths = [...analytics.participantComparison]
    .map((entry) => ({ participant: entry.participant, chars: entry.averageLength }))
    .sort((a, b) => b.chars - a.chars);

  const reciprocity = [...analytics.participantComparison]
    .map((entry) => ({
      participant: entry.participant,
      share: totalMessages === 0 ? 0 : Math.round((entry.messages / totalMessages) * 100)
    }))
    .sort((a, b) => b.share - a.share);

  const burstDays = [...analytics.activityByDay].sort((a, b) => b.count - a.count).slice(0, 5);

  const now = analytics.lastMessageAt ?? new Date();
  const recentStart = format(subDays(now, 14), "yyyy-MM-dd");
  const previousStart = format(subDays(now, 28), "yyyy-MM-dd");
  const recent = analytics.activityByDay
    .filter((entry) => entry.date >= recentStart)
    .reduce((acc, item) => acc + item.count, 0);
  const previous = analytics.activityByDay
    .filter((entry) => entry.date >= previousStart && entry.date < recentStart)
    .reduce((acc, item) => acc + item.count, 0);
  const engagementDelta = previous === 0 ? 0 : Math.round(((recent - previous) / previous) * 100);

  return {
    overview: [
      {
        label: "Total messages",
        value: formatCompact(totalMessages),
        insight: `${activeDays} active days in this filter`,
        trend: overviewTrend
      },
      {
        label: "Participants",
        value: String(analytics.participants.length),
        insight: `${analytics.participantComparison[0]?.participant ?? "-"} sends the most`
      },
      {
        label: "Median reply",
        value: `${medianReply || 0}m`,
        insight: "Cross-participant response estimate"
      },
      {
        label: "Message rhythm",
        value: `${Math.round(totalMessages / rangeDays)}/day`,
        insight: `${engagementDelta >= 0 ? "+" : ""}${engagementDelta}% vs previous two weeks`
      }
    ],
    dailyTrend: analytics.activityByDay,
    monthlyTrend: [...monthMap.entries()].map(([month, count]) => ({ month, count })),
    hourOfDay: Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count: hourMap.get(hour) ?? 0
    })),
    weekdayHour: analytics.heatmap,
    participantMessages: analytics.participantComparison
      .map((entry) => ({ participant: entry.participant, messages: entry.messages }))
      .sort((a, b) => b.messages - a.messages),
    conversationStarters,
    replyTimes,
    messageLengths,
    reciprocity,
    emojiUsage: computeEmojiUsage(filteredMessages),
    topWords: analytics.topWords,
    topDomains: analytics.topDomains,
    attachmentComposition: analytics.attachmentCounts.map((entry) => ({ label: entry.type.replace(/_/g, " "), count: entry.count })),
    streaks: { current: analytics.streaks.currentDays, longest: analytics.streaks.longestDays },
    burstDays,
    engagementDelta
  };
}
