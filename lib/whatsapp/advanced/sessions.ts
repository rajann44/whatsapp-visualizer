import { differenceInMinutes, getHours } from "date-fns";

import { type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { median, replyMinutes, safePercent, sortMessages } from "@/lib/whatsapp/advanced/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";

function sessionEnergy(messageCount: number, durationMinutes: number, medianReply: number, balance: number): number {
  const intensity = Math.min(messageCount / 30, 1) * 35;
  const density = durationMinutes === 0 ? 0 : Math.min(messageCount / Math.max(durationMinutes, 1), 1) * 25;
  const responsiveness = medianReply === 0 ? 20 : Math.max(0, 20 - Math.min(medianReply / 6, 20));
  const reciprocity = balance * 20;
  return Math.round(intensity + density + responsiveness + reciprocity);
}

export function buildSessions(messages: ChatMessage[], inactivityMinutes = 90): SessionRecord[] {
  const sorted = sortMessages(messages);
  if (sorted.length === 0) {
    return [];
  }

  const sessions: ChatMessage[][] = [];
  let current: ChatMessage[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const next = sorted[index];
    const gap = differenceInMinutes(next.timestamp, previous.timestamp);
    if (gap >= inactivityMinutes) {
      sessions.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }
  sessions.push(current);

  return sessions.map((sessionMessages, index) => {
    const start = sessionMessages[0].timestamp;
    const end = sessionMessages[sessionMessages.length - 1].timestamp;
    const durationMinutes = Math.max(differenceInMinutes(end, start), 0);
    const perParticipant = new Map<string, number>();
    sessionMessages.forEach((message) => {
      perParticipant.set(message.sender, (perParticipant.get(message.sender) ?? 0) + 1);
    });
    const participantShares = [...perParticipant.entries()]
      .map(([participant, count]) => ({ participant, count, share: safePercent(count, sessionMessages.length) }))
      .sort((a, b) => b.count - a.count);

    const replies = replyMinutes(sessionMessages).map((entry) => entry.minutes);
    const avgReply = replies.length === 0 ? null : Math.round((replies.reduce((sum, value) => sum + value, 0) / replies.length) * 10) / 10;
    const balance = participantShares.length <= 1 ? 1 : 1 - Math.abs((participantShares[0]?.share ?? 50) - (participantShares[1]?.share ?? 50)) / 100;
    const energy = sessionEnergy(sessionMessages.length, durationMinutes, median(replies), balance);

    const previousLast = index === 0 ? null : sessions[index - 1][sessions[index - 1].length - 1];
    const followsLongSilence =
      previousLast !== null && differenceInMinutes(start, previousLast.timestamp) >= inactivityMinutes * 6;

    return {
      id: `session-${index + 1}`,
      start,
      end,
      durationMinutes,
      messageCount: sessionMessages.length,
      participantShares,
      averageReplyMinutes: avgReply,
      startedBy: sessionMessages[0].sender,
      endedBy: sessionMessages[sessionMessages.length - 1].sender,
      dominantParticipant: participantShares[0]?.participant ?? sessionMessages[0].sender,
      energy,
      followsLongSilence
    };
  });
}

export function summarizeSessions(sessions: SessionRecord[]) {
  const averageDuration = sessions.length === 0 ? 0 : Math.round(sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / sessions.length);
  const startHourMap = new Map<number, number>();
  sessions.forEach((session) => {
    const hour = getHours(session.start);
    startHourMap.set(hour, (startHourMap.get(hour) ?? 0) + 1);
  });

  const commonStartHours = [...startHourMap.entries()]
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const longest = [...sessions].sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 5);
  const balanced = [...sessions]
    .filter((session) => session.participantShares.length >= 2)
    .sort((a, b) => Math.abs(50 - (a.participantShares[0]?.share ?? 50)) - Math.abs(50 - (b.participantShares[0]?.share ?? 50)))
    .slice(0, 5);
  const oneSided = [...sessions]
    .filter((session) => session.participantShares.length >= 2)
    .sort((a, b) => Math.abs(50 - (b.participantShares[0]?.share ?? 50)) - Math.abs(50 - (a.participantShares[0]?.share ?? 50)))
    .slice(0, 5);

  const revivalSessions = sessions.filter((session) => session.followsLongSilence).slice(0, 8);

  return {
    averageDuration,
    commonStartHours,
    longest,
    balanced,
    oneSided,
    revivalSessions
  };
}
