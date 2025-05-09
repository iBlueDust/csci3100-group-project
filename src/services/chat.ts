import { ConversationsResponse, MessagesResponse, SendMessagePayload } from '@/types/chat';
import { ChatMessageType } from '@/data/types/chats';

/**
 * Fetches all conversations for the current user
 */
export async function fetchConversations(
  page = 1, 
  limit = 10
): Promise<ConversationsResponse> {
  const skip = (page - 1) * limit;
  
  try {
    const response = await fetch(`/api/chats?skip=${skip}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching conversations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch a single conversation by ID
 */
export async function fetchConversation(id: string): Promise<ConversationsResponse> {
  try {
    const response = await fetch(`/api/chats?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching conversation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(
  conversationId: string, 
  page = 1, 
  limit = 20
): Promise<MessagesResponse> {
  const skip = (page - 1) * limit;
  
  try {
    const response = await fetch(`/api/chats/${conversationId}/messages?skip=${skip}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching messages: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string, 
  payload: SendMessagePayload
): Promise<{ id: string }> {
  try {
    // For file uploads we need to use FormData
    const formData = new FormData();
    formData.append('type', payload.type);
    formData.append('content', payload.content);
    
    if (payload.type === ChatMessageType.Attachment && payload.attachment) {
      formData.append('attachment', payload.attachment);
    }
    
    const response = await fetch(`/api/chats/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
      // No Content-Type header as browser sets it with boundary for FormData
    });
    
    if (!response.ok) {
      throw new Error(`Error sending message: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new conversation with a user
 */
export async function createConversation(recipientId: string): Promise<{ id: string }> {
  try {
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient: recipientId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating conversation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/chats/${conversationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting conversation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}
