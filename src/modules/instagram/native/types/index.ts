/* ─────────────────────────────────────────────────────────
   Instagram Native Business – Shared Types
───────────────────────────────────────────────────────── */

/** Full account status returned by GET /instagram/native/account/status */
export interface NativeAccountStatus {
  connected: boolean;
  account?: {
    id: string;
    instagramUserId: string;
    username: string;
    profilePictureUrl: string;
    followersCount: number;
    mediaCount: number;
    tokenExpiresAt: string;
    webhooksSubscribed: boolean;
    isActive: boolean;
    createdAt: string;
  };
}

/** A single automation trigger rule */
export interface AutomationTrigger {
  id?: string;
  triggerType: 'comment' | 'dm' | 'mention' | 'story_reply';
  triggerKeyword?: string;
  replyMessage: string;
  replyType: 'dm' | 'comment_reply';
  isActive: boolean;
}

/** View machine states for the flow orchestrator */
export type ConnectionState =
  | 'idle'          // No account – show HeroConnect
  | 'connecting'    // Redirecting browser to Instagram OAuth
  | 'processing'    // Reading callback params & refetching
  | 'connected'     // Account is connected – show ConnectedCard
  | 'configuring'   // Automation screen open
  | 'error';        // OAuth or API error

/** Query-string parameters on the OAuth callback redirect */
export interface CallbackParams {
  status?: 'success' | 'error';
  accountId?: string;
  error?: string;
  errorDescription?: string;
}
