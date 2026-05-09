import { format } from "date-fns";

import { type EnergyPoint, type EnergySummary, type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { getActiveDays, median, replyMinutes, safePercent, stdev } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

function scorePoint(messages: ChatMessage[], sessions: SessionRecord[]): EnergyPoint {
  const replies = replyMinutes(messages).map((entry) => entry.minutes);
  const replyMedian = median(replies) || 180;
  const activeDays = Math.max(getActiveDays(messages), 1);
  const messagesPerDay = messages.length / activeDays;

  const perSessionCounts = sessions.map((session) => session.messageCount);
  const burst = stdev(perSessionCounts);
  const balance = sessions.length
    ? sessions.reduce((sum, session) => {
        const top = session.participantShares[0]?.share ?? 50;
        const second = session.participantShares[1]?.share ?? 50;
        return sum + (1 - Math.abs(top - second) / 100);
      }, 0) / sessions.length
    : 0;

  const continuity = sessions.length
    ? safePercent(sessions.filter((session) => !session.followsLongSilence).length, sessions.length) / 100
    : 0;

  const normalized =
    Math.min(messagesPerDay / 25, 1) * 0.28 +
    Math.max(0, 1 - Math.min(replyMedian / 240, 1)) * 0.2 +
    Math.min(sessions.length / activeDays, 1) * 0.16 +
    Math.min(burst / 18, 1) * 0.14 +
    balance * 0.12 +
    continuity * 0.1;

  return {
    bucket: "",
    index: Math.round(normalized * 100),
    messagesPerActiveDay: Math.round(messagesPerDay * 10) / 10,
    medianReplyMinutes: Math.round(replyMedian),
    sessionDensity: Math.round((sessions.length / activeDays) * 100) / 100,
    burstiness: Math.round(burst * 10) / 10,
    participantBalance: Math.round(balance * 100),
    continuity: Math.round(continuity * 100)
  };
}

export function computeEnergy(messages: ChatMessage[], sessions: SessionRecord[]): EnergySummary {
  const monthBuckets = new Map<string, { messages: ChatMessage[]; sessions: SessionRecord[] }>();

  messages.forEach((message) => {
    const key = format(message.timestamp, "yyyy-MM");
    const current = monthBuckets.get(key) ?? { messages: [], sessions: [] };
    current.messages.push(message);
    monthBuckets.set(key, current);
  });

  sessions.forEach((session) => {
    const key = format(session.start, "yyyy-MM");
    const current = monthBuckets.get(key) ?? { messages: [], sessions: [] };
    current.sessions.push(session);
    monthBuckets.set(key, current);
  });

  const series: EnergyPoint[] = [...monthBuckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bucket, payload]) => {
      const point = scorePoint(payload.messages, payload.sessions);
      return { ...point, bucket };
    });

  const average = series.length ? series.reduce((sum, point) => sum + point.index, 0) / series.length : 0;
  const highMomentum = series.filter((point) => point.index >= average + 12).slice(-6);
  const slowFade = series.filter((point) => point.index <= average - 12).slice(-6);

  const reconnectSpikes = series
    .filter((point, index) => {
      if (index === 0) {
        return false;
      }
      return point.index - series[index - 1].index >= 18;
    })
    .slice(-6);

  const dormantPhases = series.filter((point) => point.sessionDensity <= 0.12 && point.messagesPerActiveDay < 3).slice(-6);

  return {
    series,
    highMomentum,
    slowFade,
    reconnectSpikes,
    dormantPhases
  };
}
