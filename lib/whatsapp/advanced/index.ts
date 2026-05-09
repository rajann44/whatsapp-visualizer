import { computeCuriosity, computeEngagement } from "@/lib/whatsapp/advanced/curiosity";
import { computeDrift } from "@/lib/whatsapp/advanced/drift";
import { computeEnergy } from "@/lib/whatsapp/advanced/energy";
import { computeExpressiveness } from "@/lib/whatsapp/advanced/expressiveness";
import { buildDataWarnings, buildDeterministicInsights } from "@/lib/whatsapp/advanced/insights";
import { computeReciprocityGroup, computeReciprocityOneToOne } from "@/lib/whatsapp/advanced/reciprocity";
import { computeReconnection } from "@/lib/whatsapp/advanced/reconnection";
import { buildSessions, summarizeSessions } from "@/lib/whatsapp/advanced/sessions";
import { computeTopicDrift } from "@/lib/whatsapp/advanced/topic-drift";
import { type AdvancedInsightSummary } from "@/lib/whatsapp/advanced/types";
import { type AnalyticsResult } from "@/lib/whatsapp/analytics";
import { type ChatMessage } from "@/lib/whatsapp/types";

export function computeAdvancedInsights(messages: ChatMessage[], analytics: AnalyticsResult): AdvancedInsightSummary {
  const participants = analytics.participants;
  const sessions = buildSessions(messages, 90);
  const sessionSummary = summarizeSessions(sessions);
  const isGroup = participants.length > 2;

  const drift = computeDrift(messages, sessions, participants);
  const energy = computeEnergy(messages, sessions);
  const curiosity = computeCuriosity(messages, participants);
  const engagement = computeEngagement(messages, participants, sessions);
  const expressiveness = computeExpressiveness(messages, participants);
  const reconnection = computeReconnection(sessions);
  const topicDrift = computeTopicDrift(messages, analytics.topPhrases);

  const reciprocity = isGroup
    ? {
        mode: "group" as const,
        group: computeReciprocityGroup(messages, participants, sessions)
      }
    : {
        mode: "one_to_one" as const,
        oneToOne: computeReciprocityOneToOne(messages, participants, sessions)
      };

  const partial = {
    drift,
    sessions: {
      thresholdMinutes: 90,
      records: sessions,
      ...sessionSummary
    },
    reciprocity,
    energy,
    curiosity,
    engagement,
    expressiveness,
    reconnection,
    topicDrift
  };

  return {
    ...partial,
    deterministicInsights: buildDeterministicInsights(partial),
    dataWarnings: buildDataWarnings(messages.length, sessions.length, participants.length)
  };
}
