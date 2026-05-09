import { differenceInMinutes } from "date-fns";

import { type CuriositySummary, type EngagementSummary, type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { countQuestionMarks, safePercent, sortMessages } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

export function computeCuriosity(messages: ChatMessage[], participants: string[]): CuriositySummary {
  const sorted = sortMessages(messages);
  const questionMessages = sorted.filter((message) => countQuestionMarks(message.content) > 0);
  let followUpQuestions = 0;
  let responseDepthCount = 0;
  let responseDepthTotal = 0;

  const asksVsAnswers = participants.map((participant) => ({ participant, asked: 0, answered: 0 }));
  const drivingMap = new Map<string, number>();

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const questionCount = countQuestionMarks(current.content);
    if (questionCount > 0) {
      const askedEntry = asksVsAnswers.find((entry) => entry.participant === current.sender);
      if (askedEntry) {
        askedEntry.asked += questionCount;
      }

      if (index + 1 < sorted.length && countQuestionMarks(sorted[index + 1].content) > 0) {
        followUpQuestions += 1;
      }

      let depth = 0;
      for (let j = index + 1; j < sorted.length; j += 1) {
        const next = sorted[j];
        const gap = differenceInMinutes(next.timestamp, current.timestamp);
        if (gap > 180) {
          break;
        }
        if (next.sender !== current.sender) {
          depth += 1;
          const answeredEntry = asksVsAnswers.find((entry) => entry.participant === next.sender);
          if (answeredEntry) {
            answeredEntry.answered += 1;
          }
        }
      }

      responseDepthCount += 1;
      responseDepthTotal += depth;
    }

    if (questionCount > 0 || current.hasLink || current.content.length > 120) {
      drivingMap.set(current.sender, (drivingMap.get(current.sender) ?? 0) + 1);
    }
  }

  const conversationDrivingTurns = participants
    .map((participant) => ({
      participant,
      score: Math.round(safePercent(drivingMap.get(participant) ?? 0, Math.max(sorted.length, 1)))
    }))
    .sort((a, b) => b.score - a.score);

  return {
    overallQuestionRate: Math.round(safePercent(questionMessages.length, Math.max(sorted.length, 1)) * 10) / 10,
    followUpQuestionRate: Math.round(safePercent(followUpQuestions, Math.max(questionMessages.length, 1)) * 10) / 10,
    averageResponseDepth: responseDepthCount === 0 ? 0 : Math.round((responseDepthTotal / responseDepthCount) * 10) / 10,
    asksVsAnswers,
    conversationDrivingTurns
  };
}

export function computeEngagement(messages: ChatMessage[], participants: string[], sessions: SessionRecord[]): EngagementSummary {
  const sorted = sortMessages(messages);
  const initiations = participants.map((participant) => ({
    participant,
    count: sessions.filter((session) => session.startedBy === participant).length
  }));

  const responseConsistency = participants.map((participant) => {
    let opportunities = 0;
    let responded = 0;
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous.sender === participant || current.sender === previous.sender) {
        continue;
      }
      opportunities += 1;
      if (current.sender === participant) {
        responded += 1;
      }
    }
    return {
      participant,
      rate: Math.round(safePercent(responded, Math.max(opportunities, 1)))
    };
  });

  const followUps = sorted.filter((message, index) => {
    if (index === 0) {
      return false;
    }
    const previous = sorted[index - 1];
    return previous.sender === message.sender && message.content.length > 30;
  }).length;

  const revivals = participants.map((participant) => ({
    participant,
    count: sessions.filter((session) => session.followsLongSilence && session.startedBy === participant).length
  }));

  const hangingRate = participants.map((participant) => {
    const sent = sorted.filter((message) => message.sender === participant).length;
    const hanging = sorted.filter((message, index) => {
      if (message.sender !== participant) {
        return false;
      }
      if (index === sorted.length - 1) {
        return true;
      }
      const next = sorted[index + 1];
      const gap = differenceInMinutes(next.timestamp, message.timestamp);
      return next.sender === message.sender || gap >= 360;
    }).length;
    return {
      participant,
      rate: Math.round(safePercent(hanging, Math.max(sent, 1)))
    };
  });

  return {
    initiations,
    responseConsistency,
    followUpRate: Math.round(safePercent(followUps, Math.max(sorted.length, 1)) * 10) / 10,
    sessionRevivals: revivals,
    hangingRate
  };
}
