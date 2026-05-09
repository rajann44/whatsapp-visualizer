import { type ChatMessage } from "@/lib/whatsapp/types";

export interface AnalysisContext {
  messages: ChatMessage[];
  participants: string[];
  isGroup: boolean;
}

export interface SessionRecord {
  id: string;
  start: Date;
  end: Date;
  durationMinutes: number;
  messageCount: number;
  participantShares: Array<{ participant: string; share: number; count: number }>;
  averageReplyMinutes: number | null;
  startedBy: string;
  endedBy: string;
  dominantParticipant: string;
  energy: number;
  followsLongSilence: boolean;
}

export interface DriftMetric {
  key:
    | "response_time"
    | "message_frequency"
    | "message_length"
    | "question_rate"
    | "emoji_rate"
    | "initiator_share"
    | "session_frequency"
    | "session_balance";
  label: string;
  baseline: number;
  recent: number;
  deltaPercent: number;
  direction: "up" | "down" | "flat";
  interpretation: "warming" | "stable" | "cooling";
}

export interface DriftSummary {
  overall: "warming" | "stable" | "cooling";
  metrics: DriftMetric[];
  perParticipant: Array<{
    participant: string;
    metrics: Array<Omit<DriftMetric, "key" | "label"> & { key: "message_frequency" | "question_rate" | "initiator_share" }>;
  }>;
}

export interface ReciprocityOneToOne {
  messageShare: Array<{ participant: string; share: number }>;
  replyShare: Array<{ participant: string; share: number }>;
  starterShare: Array<{ participant: string; share: number }>;
  questionShare: Array<{ participant: string; share: number }>;
  averageImposedWait: Array<{ participant: string; minutes: number }>;
  averageSessionDominance: Array<{ participant: string; share: number }>;
  monologueTendency: Array<{ participant: string; rate: number }>;
  reciprocityScore: number;
  balanceLabel: "balanced" | "slightly uneven" | "strongly uneven";
}

export interface ReciprocityGroup {
  participationConcentration: number;
  topSpeakerDominance: number;
  silentMemberRatio: number;
  initiatorDiversity: number;
  responseCentrality: Array<{ participant: string; share: number }>;
}

export interface EnergyPoint {
  bucket: string;
  index: number;
  messagesPerActiveDay: number;
  medianReplyMinutes: number;
  sessionDensity: number;
  burstiness: number;
  participantBalance: number;
  continuity: number;
}

export interface EnergySummary {
  series: EnergyPoint[];
  highMomentum: EnergyPoint[];
  slowFade: EnergyPoint[];
  reconnectSpikes: EnergyPoint[];
  dormantPhases: EnergyPoint[];
}

export interface CuriositySummary {
  overallQuestionRate: number;
  followUpQuestionRate: number;
  averageResponseDepth: number;
  asksVsAnswers: Array<{ participant: string; asked: number; answered: number }>;
  conversationDrivingTurns: Array<{ participant: string; score: number }>;
}

export interface EngagementSummary {
  initiations: Array<{ participant: string; count: number }>;
  responseConsistency: Array<{ participant: string; rate: number }>;
  followUpRate: number;
  sessionRevivals: Array<{ participant: string; count: number }>;
  hangingRate: Array<{ participant: string; rate: number }>;
}

export interface ExpressivenessSummary {
  trend: "more_expressive" | "more_terse" | "stable";
  emojiRate: number;
  punctuationIntensity: number;
  shareRate: number;
  averageLength: number;
  lengthVariance: number;
  shortAcknowledgementRatio: number;
  participantComparison: Array<{
    participant: string;
    emojiRate: number;
    avgLength: number;
    shortAckRatio: number;
  }>;
}

export interface ReconnectionMoment {
  at: Date;
  silenceHours: number;
  breaker: string;
  sessionEnergy: number;
  strongerThanAverage: boolean;
}

export interface ReconnectionSummary {
  longestGapHours: number;
  longSilenceFrequency: number;
  silenceBreakers: Array<{ participant: string; count: number }>;
  averageReconnectionEnergy: number;
  averageSessionEnergy: number;
  moments: ReconnectionMoment[];
}

export interface TopicDriftSummary {
  monthlyKeywords: Array<{ month: string; items: Array<{ label: string; count: number }> }>;
  monthlyDomains: Array<{ month: string; items: Array<{ label: string; count: number }> }>;
  monthlyEmojiGroups: Array<{ month: string; items: Array<{ label: string; count: number }> }>;
  monthlyAttachmentTypes: Array<{ month: string; items: Array<{ label: string; count: number }> }>;
  recurringPhrases: Array<{ phrase: string; count: number }>;
  emergingTopics: string[];
  disappearingTopics: string[];
  stableTopics: string[];
}

export interface AdvancedInsightSummary {
  drift: DriftSummary;
  sessions: {
    thresholdMinutes: number;
    records: SessionRecord[];
    averageDuration: number;
    commonStartHours: Array<{ hour: number; count: number }>;
    longest: SessionRecord[];
    balanced: SessionRecord[];
    oneSided: SessionRecord[];
    revivalSessions: SessionRecord[];
  };
  reciprocity: {
    mode: "one_to_one" | "group";
    oneToOne?: ReciprocityOneToOne;
    group?: ReciprocityGroup;
  };
  energy: EnergySummary;
  curiosity: CuriositySummary;
  engagement: EngagementSummary;
  expressiveness: ExpressivenessSummary;
  reconnection: ReconnectionSummary;
  topicDrift: TopicDriftSummary;
  deterministicInsights: string[];
  dataWarnings: string[];
}
