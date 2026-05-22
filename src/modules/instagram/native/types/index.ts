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

/** Detailed profile from GET /instagram/native/profile/:accountId */
export interface InstagramProfile {
  id: string;
  instagramUserId: string;
  username: string;
  name?: string;
  biography?: string;
  profilePictureUrl: string;
  followersCount: number;
  followsCount?: number;
  mediaCount: number;
  accountType?: string;          // "BUSINESS" | "CREATOR"
  tokenExpiresAt: string;
  webhooksSubscribed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** A single post from GET /instagram/native/posts/:accountId */
export interface InstagramPost {
  id: string;
  mediaId?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string;
  media_type?: string;
  mediaUrl?: string;
  media_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  likeCount?: number;
  like_count?: number;
  commentsCount?: number;
  comments_count?: number;
}

/** Paginated posts response */
export interface PostsResponse {
  posts: InstagramPost[];
  pagination?: {
    cursor?: string;
    hasMore?: boolean;
    total?: number;
  };
}

/** A single comment from GET /instagram/native/post/:mediaId/comments */
export interface InstagramComment {
  id: string;
  commentId: string;
  username: string;
  text: string;
  timestamp: string;
  hidden: boolean;
  replied: boolean;
  parentId?: string;
  likeCount?: number;
}

/** Comments response */
export interface CommentsResponse {
  comments: InstagramComment[];
  total?: number;
}

/** A single automation trigger rule */
export interface AutomationTrigger {
  id?: string;
  accountId?: string;
  triggerType: 'comment' | 'dm' | 'mention' | 'story_reply';
  triggerKeyword?: string;
  matchType?: 'exact' | 'contains';
  replyMessage: string;
  replyType: 'dm' | 'comment_reply';
  isActive: boolean;
}

/** View machine states for the flow orchestrator */
export type ConnectionState =
  | 'idle'          // No account – show HeroConnect
  | 'connecting'    // Redirecting browser to Instagram OAuth
  | 'processing'    // Reading callback params & refetching
  | 'connected'     // Account is connected – show management screen
  | 'configuring'   // Automation screen open
  | 'error';        // OAuth or API error

/** Query-string parameters on the OAuth callback redirect */
export interface CallbackParams {
  status?: 'success' | 'error';
  accountId?: string;
  error?: string;
  errorDescription?: string;
  message?: string;
}

/** Token status derived from expiry date */
export type TokenStatus = 'connected' | 'expiring_soon' | 'expired' | 'disconnected';

/** A single webhook event from GET /instagram/native/webhook/events */
export interface WebhookEvent {
  id: string;
  eventType: string;          // e.g. "comments", "messages", "mentions"
  commentText?: string;
  username?: string;
  mediaId?: string;
  timestamp: string;
  processed: boolean;
  autoReplySent?: boolean;
  rawPayload?: Record<string, unknown>;
}

/** Webhook events list response */
export interface WebhookEventsResponse {
  events: WebhookEvent[];
  total?: number;
}

/**
 * Flat automation config for POST /instagram/native/automation
 * (distinct from the per-trigger AutomationTrigger shape)
 */
export interface AutomationConfig {
  accountId: string;
  keywords: string[];
  replyType: 'public' | 'private';
  replyMessage: string;
  isEnabled: boolean;
}
