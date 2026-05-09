import { addDays, differenceInCalendarDays, isAfter, isBefore } from "date-fns";

import { type DriftMetric, type DriftSummary, type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { countEmojis, countQuestionMarks, getActiveDays, median, replyMinutes, safePercent } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

function classify(deltaPercent: number, reverse = false): { direction: "up" | "down" | "flat"; interpretation: "warming" | "stable" | "cooling" } {
  if (Math.abs(deltaPercent) < 8) {
    return { direction: "flat", interpretation: "stable" };
  }
  const up = deltaPercent > 0;
  if (reverse) {
    return up ? { direction: "up", interpretation: "cooling" } : { direction: "down", interpretation: "warming" };
  }
  return up ? { direction: "up", interpretation: "warming" } : { direction: "down", interpretation: "cooling" };
}

function metric(label: string, key: DriftMetric["key"], baseline: number, recent: number, reverse = false): DriftMetric {
  const deltaPercent = baseline === 0 ? 0 : ((recent - baseline) / baseline) * 100;
  const classification = classify(deltaPercent, reverse);
  return {
    key,
    label,
    baseline,
    recent,
    deltaPercent: Math.round(deltaPercent * 10) / 10,
    direction: classification.direction,
    interpretation: classification.interpretation
  };
}

function summarize(messages: ChatMessage[], sessions: SessionRecord[], initiators: string[]) {
  const questionCount = messages.reduce((sum, message) => sum + countQuestionMarks(message.content), 0);
  const emojiCount = messages.reduce((sum, message) => sum + countEmojis(message.content), 0);
  const replies = replyMinutes(messages).map((entry) => entry.minutes);
  const messageLength = messages.length === 0 ? 0 : messages.reduce((sum, message) => sum + message.content.length, 0) / messages.length;
  const initiatorLead = initiators.length === 0 ? 0 : safePercent(initiators.filter((name) => name === initiators[0]).length, initiators.length);
  const balance =
    sessions.length === 0
      ? 0
      : sessions.reduce((sum, session) => {
          const first = session.participantShares[0]?.share ?? 50;
          const second = session.participantShares[1]?.share ?? 50;
          return sum + (1 - Math.abs(first - second) / 100);
        }, 0) / sessions.length;

  return {
    responseTime: median(replies),
    frequency: messages.length / Math.max(getActiveDays(messages), 1),
    messageLength,
    questionRate: safePercent(questionCount, Math.max(messages.length, 1)),
    emojiRate: safePercent(emojiCount, Math.max(messages.length, 1)),
    initiatorShare: initiatorLead,
    sessionFrequency: sessions.length / Math.max(getActiveDays(messages), 1),
    sessionBalance: balance * 100
  };
}

export function computeDrift(messages: ChatMessage[], sessions: SessionRecord[], participants: string[]): DriftSummary {
  if (messages.length < 20) {
    return { overall: "stable", metrics: [], perParticipant: [] };
  }

  const sorted = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const start = sorted[0].timestamp;
  const end = sorted[sorted.length - 1].timestamp;
  const halfDays = Math.max(7, Math.floor(differenceInCalendarDays(end, start) / 2));
  const split = addDays(start, halfDays);

  const baselineMessages = sorted.filter((message) => isBefore(message.timestamp, split));
  const recentMessages = sorted.filter((message) => isAfter(message.timestamp, split));

  const baselineSessions = sessions.filter((session) => isBefore(session.start, split));
  const recentSessions = sessions.filter((session) => isAfter(session.start, split));

  const baselineInitiators = baselineSessions.map((session) => session.startedBy);
  const recentInitiators = recentSessions.map((session) => session.startedBy);

  const baseline = summarize(baselineMessages, baselineSessions, baselineInitiators);
  const recent = summarize(recentMessages, recentSessions, recentInitiators);

  const metrics: DriftMetric[] = [
    metric("Response time", "response_time", baseline.responseTime, recent.responseTime, true),
    metric("Message frequency", "message_frequency", baseline.frequency, recent.frequency),
    metric("Average message length", "message_length", baseline.messageLength, recent.messageLength),
    metric("Question rate", "question_rate", baseline.questionRate, recent.questionRate),
    metric("Emoji rate", "emoji_rate", baseline.emojiRate, recent.emojiRate),
    metric("Initiator concentration", "initiator_share", baseline.initiatorShare, recent.initiatorShare, true),
    metric("Session frequency", "session_frequency", baseline.sessionFrequency, recent.sessionFrequency),
    metric("Session balance", "session_balance", baseline.sessionBalance, recent.sessionBalance)
  ];

  const warmCount = metrics.filter((entry) => entry.interpretation === "warming").length;
  const coolCount = metrics.filter((entry) => entry.interpretation === "cooling").length;
  const overall = warmCount - coolCount >= 2 ? "warming" : coolCount - warmCount >= 2 ? "cooling" : "stable";

  const perParticipant = participants.map((participant) => {
    const bMessages = baselineMessages.filter((message) => message.sender === participant);
    const rMessages = recentMessages.filter((message) => message.sender === participant);
    const bQuestionRate = safePercent(bMessages.reduce((sum, msg) => sum + countQuestionMarks(msg.content), 0), Math.max(bMessages.length, 1));
    const rQuestionRate = safePercent(rMessages.reduce((sum, msg) => sum + countQuestionMarks(msg.content), 0), Math.max(rMessages.length, 1));
    const bInitiator = safePercent(baselineInitiators.filter((name) => name === participant).length, Math.max(baselineInitiators.length, 1));
    const rInitiator = safePercent(recentInitiators.filter((name) => name === participant).length, Math.max(recentInitiators.length, 1));

    const perMetrics: Array<{
      key: "message_frequency" | "question_rate" | "initiator_share";
      baseline: number;
      recent: number;
      direction: "up" | "down" | "flat";
      interpretation: "warming" | "stable" | "cooling";
      deltaPercent: number;
    }> = [
      {
        key: "message_frequency",
        baseline: bMessages.length / Math.max(getActiveDays(bMessages), 1),
        recent: rMessages.length / Math.max(getActiveDays(rMessages), 1),
        ...classify(
          bMessages.length === 0
            ? 0
            : ((rMessages.length / Math.max(getActiveDays(rMessages), 1) - bMessages.length / Math.max(getActiveDays(bMessages), 1)) /
                (bMessages.length / Math.max(getActiveDays(bMessages), 1))) *
                100
        ),
        deltaPercent:
          bMessages.length === 0
            ? 0
            : Math.round(
                ((((rMessages.length / Math.max(getActiveDays(rMessages), 1) - bMessages.length / Math.max(getActiveDays(bMessages), 1)) /
                  (bMessages.length / Math.max(getActiveDays(bMessages), 1))) *
                  100) *
                  10)
              ) / 10
      },
      {
        key: "question_rate",
        baseline: bQuestionRate,
        recent: rQuestionRate,
        ...classify(bQuestionRate === 0 ? 0 : ((rQuestionRate - bQuestionRate) / bQuestionRate) * 100),
        deltaPercent: bQuestionRate === 0 ? 0 : Math.round((((rQuestionRate - bQuestionRate) / bQuestionRate) * 100) * 10) / 10
      },
      {
        key: "initiator_share",
        baseline: bInitiator,
        recent: rInitiator,
        ...classify(bInitiator === 0 ? 0 : ((rInitiator - bInitiator) / bInitiator) * 100),
        deltaPercent: bInitiator === 0 ? 0 : Math.round((((rInitiator - bInitiator) / bInitiator) * 100) * 10) / 10
      }
    ];

    return {
      participant,
      metrics: perMetrics
    };
  });

  return { overall, metrics, perParticipant };
}
