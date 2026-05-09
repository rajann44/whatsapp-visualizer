import { format } from "date-fns";

import { type AnalyticsResult } from "@/lib/whatsapp/analytics";
import { type ParseResult } from "@/lib/whatsapp/types";

interface ExportPayload {
  generatedAt: string;
  parseStats: ParseResult["parseStats"];
  filters: {
    participant: string;
    messageType: string;
    from?: string;
    to?: string;
  };
  analytics: AnalyticsResult;
}

export function buildJsonExport(payload: ExportPayload): string {
  return JSON.stringify(payload, null, 2);
}

function csvEscape(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildCsvExport(analytics: AnalyticsResult): string {
  const rows: string[][] = [];
  rows.push(["metric", "value"]);
  rows.push(["total_messages", String(analytics.totalMessages)]);
  rows.push(["participant_count", String(analytics.participants.length)]);
  rows.push(["first_message", analytics.firstMessageAt ? format(analytics.firstMessageAt, "yyyy-MM-dd HH:mm:ss") : ""]);
  rows.push(["last_message", analytics.lastMessageAt ? format(analytics.lastMessageAt, "yyyy-MM-dd HH:mm:ss") : ""]);
  rows.push(["message_length_mean", String(analytics.messageLength.mean)]);
  rows.push(["message_length_p50", String(analytics.messageLength.p50)]);
  rows.push(["message_length_p90", String(analytics.messageLength.p90)]);

  rows.push(["", ""]);
  rows.push(["participant", "messages"]);
  analytics.participantComparison.forEach((participant) => {
    rows.push([participant.participant, String(participant.messages)]);
  });

  rows.push(["", ""]);
  rows.push(["date", "message_count"]);
  analytics.activityByDay.forEach((activity) => {
    rows.push([activity.date, String(activity.count)]);
  });

  return rows.map((row) => row.map((value) => csvEscape(value)).join(",")).join("\n");
}
