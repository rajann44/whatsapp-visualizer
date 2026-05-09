import { differenceInMinutes } from "date-fns";

import { type ReciprocityGroup, type ReciprocityOneToOne, type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { countQuestionMarks, replyMinutes, safePercent, sortMessages } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

function gini(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  if (sum === 0) {
    return 0;
  }
  let cumulative = 0;
  sorted.forEach((value, index) => {
    cumulative += (index + 1) * value;
  });
  return (2 * cumulative) / (n * sum) - (n + 1) / n;
}

export function computeReciprocityOneToOne(messages: ChatMessage[], participants: string[], sessions: SessionRecord[]): ReciprocityOneToOne {
  const sorted = sortMessages(messages);
  const total = sorted.length;

  const messageShare = participants.map((participant) => ({
    participant,
    share: Math.round(safePercent(sorted.filter((message) => message.sender === participant).length, total))
  }));

  const replies = replyMinutes(sorted);
  const replyShare = participants.map((participant) => ({
    participant,
    share: Math.round(safePercent(replies.filter((entry) => entry.sender === participant).length, Math.max(replies.length, 1)))
  }));

  const starterShare = participants.map((participant) => ({
    participant,
    share: Math.round(safePercent(sessions.filter((session) => session.startedBy === participant).length, Math.max(sessions.length, 1)))
  }));

  const questionShare = participants.map((participant) => {
    const participantQuestions = sorted
      .filter((message) => message.sender === participant)
      .reduce((sum, message) => sum + countQuestionMarks(message.content), 0);
    const totalQuestions = sorted.reduce((sum, message) => sum + countQuestionMarks(message.content), 0);
    return {
      participant,
      share: Math.round(safePercent(participantQuestions, Math.max(totalQuestions, 1)))
    };
  });

  const averageImposedWait = participants.map((participant) => {
    const waits: number[] = [];
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous.sender !== participant || current.sender === previous.sender) {
        continue;
      }
      const wait = differenceInMinutes(current.timestamp, previous.timestamp);
      if (wait > 0 && wait <= 24 * 60) {
        waits.push(wait);
      }
    }
    return {
      participant,
      minutes: waits.length ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length) : 0
    };
  });

  const averageSessionDominance = participants.map((participant) => {
    const shares = sessions
      .map((session) => session.participantShares.find((entry) => entry.participant === participant)?.share ?? 0)
      .filter((value) => value > 0);
    return {
      participant,
      share: shares.length ? Math.round(shares.reduce((sum, value) => sum + value, 0) / shares.length) : 0
    };
  });

  const monologueTendency = participants.map((participant) => {
    let runs = 0;
    let monologues = 0;
    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index].sender === participant && sorted[index - 1].sender === participant) {
        runs += 1;
        if (index + 1 < sorted.length && sorted[index + 1].sender === participant) {
          monologues += 1;
        }
      }
    }
    return {
      participant,
      rate: Math.round(safePercent(monologues, Math.max(runs, 1)))
    };
  });

  const shareSpread = Math.abs((messageShare[0]?.share ?? 50) - (messageShare[1]?.share ?? 50));
  const starterSpread = Math.abs((starterShare[0]?.share ?? 50) - (starterShare[1]?.share ?? 50));
  const replySpread = Math.abs((replyShare[0]?.share ?? 50) - (replyShare[1]?.share ?? 50));
  const reciprocityScore = Math.max(0, Math.round(100 - (shareSpread * 0.5 + starterSpread * 0.3 + replySpread * 0.2)));
  const balanceLabel = reciprocityScore >= 78 ? "balanced" : reciprocityScore >= 56 ? "slightly uneven" : "strongly uneven";

  return {
    messageShare,
    replyShare,
    starterShare,
    questionShare,
    averageImposedWait,
    averageSessionDominance,
    monologueTendency,
    reciprocityScore,
    balanceLabel
  };
}

export function computeReciprocityGroup(messages: ChatMessage[], participants: string[], sessions: SessionRecord[]): ReciprocityGroup {
  const counts = participants.map((participant) => messages.filter((message) => message.sender === participant).length);
  const topSpeaker = Math.max(...counts, 0);
  const total = counts.reduce((sum, value) => sum + value, 0);

  const initiatorDiversity = sessions.length === 0 ? 0 : new Set(sessions.map((session) => session.startedBy)).size / participants.length;

  const replyShareMap = new Map<string, number>();
  replyMinutes(messages).forEach((entry) => {
    replyShareMap.set(entry.sender, (replyShareMap.get(entry.sender) ?? 0) + 1);
  });

  const responseCentrality = participants
    .map((participant) => ({
      participant,
      share: Math.round(safePercent(replyShareMap.get(participant) ?? 0, Math.max([...replyShareMap.values()].reduce((sum, value) => sum + value, 0), 1)))
    }))
    .sort((a, b) => b.share - a.share);

  return {
    participationConcentration: Math.round(gini(counts) * 100),
    topSpeakerDominance: Math.round(safePercent(topSpeaker, Math.max(total, 1))),
    silentMemberRatio: Math.round(safePercent(counts.filter((count) => count <= Math.max(total / participants.length / 3, 2)).length, participants.length)),
    initiatorDiversity: Math.round(initiatorDiversity * 100),
    responseCentrality
  };
}
