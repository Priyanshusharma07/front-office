export interface InstagramAccount {
  id: string;
  instagramBusinessId: string;
  username: string;
  profilePicture?: string;
  isSubscribed: boolean;
  tokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
