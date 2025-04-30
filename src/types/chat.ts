import { ChatMessageType } from '@/data/types/chats'
import type { PaginatedResult } from '@/data/types/common'

// Frontend-friendly chat type
export interface Conversation {
  id: string
  participants: {
    id: string
    username: string
  }[]
  lastMessage?: Message
  wasRequestedToDelete: boolean
}

export interface Message {
  id: string
  sender: string
  content: string
  sentAt: string
  type: ChatMessageType
  contentFilename?: string
}

export interface SendMessagePayload {
  content: string
  type: ChatMessageType
  attachment?: File
}

export type ConversationsResponse = PaginatedResult<Conversation>
export type MessagesResponse = PaginatedResult<Message>

// Chat state for contexts and hooks
export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
