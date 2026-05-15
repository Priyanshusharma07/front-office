export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'customer';
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'pending';
}

