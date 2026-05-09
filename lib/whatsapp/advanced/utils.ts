import { differenceInMinutes, format } from "date-fns";

import { type ChatMessage } from "@/lib/whatsapp/types";

export function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function getActiveDays(messages: ChatMessage[]): number {
  return new Set(messages.map((message) => format(message.timestamp, "yyyy-MM-dd"))).size;
}

export function safePercent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return (numerator / denominator) * 100;
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function stdev(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function countQuestionMarks(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

export function countEmojis(text: string): number {
  return (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
}

export function isShortAcknowledgement(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  const shortSet = new Set(["ok", "okay", "hmm", "h", "k", "done", "great", "thanks", "thank you", "yes", "no"]);
  return normalized.length <= 12 && shortSet.has(normalized);
}

export function replyMinutes(messages: ChatMessage[]): Array<{ sender: string; minutes: number }> {
  const sorted = sortMessages(messages);
  const output: Array<{ sender: string; minutes: number }> = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (current.sender === previous.sender) {
      continue;
    }
    const diff = differenceInMinutes(current.timestamp, previous.timestamp);
    if (diff > 0 && diff <= 24 * 60) {
      output.push({ sender: current.sender, minutes: diff });
    }
  }
  return output;
}

export function bucketByMonth(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const map = new Map<string, ChatMessage[]>();
  messages.forEach((message) => {
    const key = format(message.timestamp, "yyyy-MM");
    const current = map.get(key) ?? [];
    current.push(message);
    map.set(key, current);
  });
  return map;
}

export function bucketByWeek(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const map = new Map<string, ChatMessage[]>();
  messages.forEach((message) => {
    const key = format(message.timestamp, "yyyy-'W'II");
    const current = map.get(key) ?? [];
    current.push(message);
    map.set(key, current);
  });
  return map;
}
