export type TriggerType = 'ALL_COMMENTS' | 'KEYWORDS' | 'REGEX';

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: TriggerType;
  keywords: string[];
  replyMessage: string;
  delayTime: number; // in minutes
  isActive: boolean;
  matchCount: number;
  lastMatched: string | null;
}
