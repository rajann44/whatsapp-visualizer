import { differenceInHours } from "date-fns";

import { type ReconnectionSummary, type SessionRecord } from "@/lib/whatsapp/advanced/types";
import { safePercent } from "@/lib/whatsapp/advanced/utils";

export function computeReconnection(sessions: SessionRecord[]): ReconnectionSummary {
  if (sessions.length === 0) {
    return {
      longestGapHours: 0,
      longSilenceFrequency: 0,
      silenceBreakers: [],
      averageReconnectionEnergy: 0,
      averageSessionEnergy: 0,
      moments: []
    };
  }

  let longestGapHours = 0;
  const moments = [];
  const breakerMap = new Map<string, number>();

  for (let index = 1; index < sessions.length; index += 1) {
    const previous = sessions[index - 1];
    const current = sessions[index];
    const gap = differenceInHours(current.start, previous.end);
    longestGapHours = Math.max(longestGapHours, gap);
    if (gap >= 12) {
      breakerMap.set(current.startedBy, (breakerMap.get(current.startedBy) ?? 0) + 1);
      moments.push({
        at: current.start,
        silenceHours: gap,
        breaker: current.startedBy,
        sessionEnergy: current.energy,
        strongerThanAverage: false
      });
    }
  }

  const averageSessionEnergy = sessions.reduce((sum, session) => sum + session.energy, 0) / sessions.length;
  moments.forEach((moment) => {
    moment.strongerThanAverage = moment.sessionEnergy >= averageSessionEnergy;
  });

  const averageReconnectionEnergy = moments.length
    ? moments.reduce((sum, moment) => sum + moment.sessionEnergy, 0) / moments.length
    : 0;

  return {
    longestGapHours,
    longSilenceFrequency: Math.round(safePercent(moments.length, Math.max(sessions.length, 1))),
    silenceBreakers: [...breakerMap.entries()].map(([participant, count]) => ({ participant, count })).sort((a, b) => b.count - a.count),
    averageReconnectionEnergy: Math.round(averageReconnectionEnergy),
    averageSessionEnergy: Math.round(averageSessionEnergy),
    moments: moments.slice(-12)
  };
}
