import { type AdvancedInsightSummary } from "@/lib/whatsapp/advanced/types";

export function buildDeterministicInsights(summary: Omit<AdvancedInsightSummary, "deterministicInsights" | "dataWarnings">): string[] {
  const statements: string[] = [];

  const responseDrift = summary.drift.metrics.find((metric) => metric.key === "response_time");
  if (responseDrift && Math.abs(responseDrift.deltaPercent) >= 12) {
    statements.push(
      responseDrift.deltaPercent > 0
        ? "Reply speed has slowed in the recent period compared with baseline."
        : "Reply speed has improved in the recent period compared with baseline."
    );
  }

  const starterDrift = summary.drift.metrics.find((metric) => metric.key === "initiator_share");
  if (starterDrift && Math.abs(starterDrift.deltaPercent) >= 12) {
    statements.push(
      starterDrift.deltaPercent > 0
        ? "Conversation starts have become more concentrated with one participant."
        : "Conversation starts are becoming more distributed across participants."
    );
  }

  if (summary.energy.slowFade.length > 0) {
    statements.push("Recent energy buckets include low-momentum phases relative to historical average.");
  }
  if (summary.energy.reconnectSpikes.length > 0) {
    statements.push("There are notable reconnect spikes after quieter periods.");
  }

  if (summary.expressiveness.trend === "more_terse") {
    statements.push("Recent communication appears more concise than baseline periods.");
  }
  if (summary.expressiveness.trend === "more_expressive") {
    statements.push("Recent communication appears more expressive than baseline periods.");
  }

  if (summary.engagement.followUpRate < 8) {
    statements.push("Follow-up turns are relatively low, suggesting shorter exchange chains.");
  }

  const topSilenceBreaker = summary.reconnection.silenceBreakers[0];
  if (topSilenceBreaker && topSilenceBreaker.count >= 2) {
    statements.push(`Long silences are most often broken by ${topSilenceBreaker.participant}.`);
  }

  if (summary.reciprocity.mode === "one_to_one" && summary.reciprocity.oneToOne) {
    const reciprocal = summary.reciprocity.oneToOne;
    statements.push(`Reciprocity model indicates this conversation is ${reciprocal.balanceLabel}.`);
  }
  if (summary.reciprocity.mode === "group" && summary.reciprocity.group) {
    const group = summary.reciprocity.group;
    if (group.topSpeakerDominance >= 45) {
      statements.push("Group participation is concentrated around a small set of active speakers.");
    }
  }

  if (summary.topicDrift.emergingTopics.length > 0) {
    statements.push(`Emerging recent topics include ${summary.topicDrift.emergingTopics.slice(0, 3).join(", ")}.`);
  }

  return statements.slice(0, 10);
}

export function buildDataWarnings(sampleSize: number, sessionCount: number, participantCount: number): string[] {
  const warnings: string[] = [];
  if (sampleSize < 80) {
    warnings.push("Sample size is small; advanced trend metrics may be less stable.");
  }
  if (sessionCount < 8) {
    warnings.push("Few detected sessions; session-based interpretations are limited.");
  }
  if (participantCount <= 1) {
    warnings.push("Single-participant data cannot support reciprocity or response analysis.");
  }
  return warnings;
}
