import { countEmojis, isShortAcknowledgement, safePercent, stdev } from "@/lib/whatsapp/advanced/utils";
import { type ExpressivenessSummary } from "@/lib/whatsapp/advanced/types";
import { type ChatMessage } from "@/lib/whatsapp/types";

function punctuationIntensity(messages: ChatMessage[]): number {
  const punctuations = messages.reduce((sum, message) => sum + (message.content.match(/[!?.,]/g) ?? []).length, 0);
  return messages.length === 0 ? 0 : punctuations / messages.length;
}

export function computeExpressiveness(messages: ChatMessage[], participants: string[]): ExpressivenessSummary {
  const emojiCount = messages.reduce((sum, message) => sum + countEmojis(message.content), 0);
  const shareCount = messages.filter((message) => message.hasLink || ["media_omitted", "document_omitted"].includes(message.messageType)).length;
  const lengths = messages.map((message) => message.content.length);
  const shortAcknowledgements = messages.filter((message) => isShortAcknowledgement(message.content)).length;

  const recent = messages.slice(Math.floor(messages.length * 0.65));
  const baseline = messages.slice(0, Math.floor(messages.length * 0.65));
  const recentExpressiveness = (recent.reduce((sum, message) => sum + countEmojis(message.content), 0) + recent.reduce((sum, message) => sum + message.content.length, 0) / 50) /
    Math.max(recent.length, 1);
  const baselineExpressiveness =
    (baseline.reduce((sum, message) => sum + countEmojis(message.content), 0) + baseline.reduce((sum, message) => sum + message.content.length, 0) / 50) /
    Math.max(baseline.length, 1);
  const change = baselineExpressiveness === 0 ? 0 : ((recentExpressiveness - baselineExpressiveness) / baselineExpressiveness) * 100;

  return {
    trend: change >= 8 ? "more_expressive" : change <= -8 ? "more_terse" : "stable",
    emojiRate: Math.round(safePercent(emojiCount, Math.max(messages.length, 1)) * 10) / 10,
    punctuationIntensity: Math.round(punctuationIntensity(messages) * 10) / 10,
    shareRate: Math.round(safePercent(shareCount, Math.max(messages.length, 1)) * 10) / 10,
    averageLength: lengths.length ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length) : 0,
    lengthVariance: Math.round(stdev(lengths)),
    shortAcknowledgementRatio: Math.round(safePercent(shortAcknowledgements, Math.max(messages.length, 1)) * 10) / 10,
    participantComparison: participants.map((participant) => {
      const scoped = messages.filter((message) => message.sender === participant);
      const scopedLengths = scoped.map((message) => message.content.length);
      return {
        participant,
        emojiRate: Math.round(safePercent(scoped.reduce((sum, message) => sum + countEmojis(message.content), 0), Math.max(scoped.length, 1)) * 10) / 10,
        avgLength: scopedLengths.length ? Math.round(scopedLengths.reduce((sum, value) => sum + value, 0) / scopedLengths.length) : 0,
        shortAckRatio: Math.round(safePercent(scoped.filter((message) => isShortAcknowledgement(message.content)).length, Math.max(scoped.length, 1)) * 10) / 10
      };
    })
  };
}
