/* ─────────────────────────────────────────────────────────
   Instagram Native Business – Shared Types
───────────────────────────────────────────────────────── */

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface NativeAccountStatus {
  accountId: string;
  instagramUsername: string;
  instagramBusinessId: string;
  webhookStatus: 'active' | 'inactive' | 'error';
  automationStatus: 'active' | 'inactive';
  tokenExpiresAt?: string;
  connectedAt?: string;
  isActive?: boolean;
}

export interface NativeTriggerPayload {
  instagramBusinessId: string;
  triggerType: string;
  replyMessage: string;
  enabled: boolean;
}

export type NativeView = 'connect' | 'automation';
