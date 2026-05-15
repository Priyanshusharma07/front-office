import apiClient from '@/services/apiClient';
import { InstagramAccount } from '@/types/instagram';

export const InstagramService = {
  /**
   * Get the backend OAuth URL. The backend will redirect to Meta login.
   * We navigate the browser directly to this URL.
   */
  getConnectUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/instagram/connect`;
  },

  /**
   * Fetch all connected Instagram accounts for the current user.
   */
  async getAccounts(token: string): Promise<InstagramAccount[]> {
    const { data } = await apiClient.get('/instagram/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  /**
   * Disconnect an Instagram account by ID.
   */
  async disconnectAccount(id: string, token: string): Promise<void> {
    await apiClient.delete(`/instagram/accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
