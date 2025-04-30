import { useState, useEffect, useCallback } from 'react'
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  deleteConversation,
  createConversation
} from '@/services/chat'
import { ChatState, Message, SendMessagePayload } from '@/types/chat'
import { ChatMessageType } from '@/data/types/chats'

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
}

export function useChat() {
  const [state, setState] = useState<ChatState>(initialState)

  // Load conversations
  const loadConversations = useCallback(async (page = 1, limit = 10) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetchConversations(page, limit)

      setState(prev => ({
        ...prev,
        conversations: response.data,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: response.meta.total,
          totalPages: Math.ceil(response.meta.total / limit)
        },
        loading: false
      }))

      return response.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversations'
      }))
      return []
    }
  }, [])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, page = 1, limit = 20) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetchMessages(conversationId, page, limit)

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: response.data,
        },
        loading: false
      }))

      return response.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to load messages for conversation ${conversationId}`
      }))
      return []
    }
  }, [])

  // Set active conversation
  const setActiveConversation = useCallback(async (conversationId: string | null) => {
    setState(prev => ({ ...prev, activeConversationId: conversationId }))

    if (conversationId) {
      // Load messages for this conversation if we don't already have them
      if (!state.messages[conversationId] || state.messages[conversationId].length === 0) {
        await loadMessages(conversationId)
      }
    }
  }, [state.messages, loadMessages])

  // Send a new message
  const sendNewMessage = useCallback(async (content: string, attachment?: File) => {
    if (!state.activeConversationId) return null

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const payload: SendMessagePayload = attachment
        ? {
          content: attachment.name,
          type: ChatMessageType.Attachment,
          attachment
        }
        : {
          content,
          type: ChatMessageType.Text
        }

      const response = await sendMessage(state.activeConversationId, payload)

      // Optimistically update the UI with the new message
      const newMessage: Message = {
        id: response.id,
        sender: 'me', // This will be replaced with actual sender ID when we reload
        content: payload.content,
        type: payload.type,
        sentAt: new Date().toISOString(),
        contentFilename: attachment?.name
      }

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [state.activeConversationId!]: [
            newMessage,
            ...(prev.messages[state.activeConversationId!] || [])
          ]
        },
        loading: false
      }))

      // Reload conversations to get updated last message
      await loadConversations(state.pagination.currentPage, state.pagination.itemsPerPage)

      return response
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }))
      return null
    }
  }, [state.activeConversationId, loadConversations, state.pagination])

  // Delete a conversation
  const deleteChat = useCallback(async (conversationId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteConversation(conversationId)

      // If this was the active conversation, clear it
      if (state.activeConversationId === conversationId) {
        setState(prev => ({ ...prev, activeConversationId: null }))
      }

      // Reload conversations
      await loadConversations(state.pagination.currentPage, state.pagination.itemsPerPage)

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to delete conversation ${conversationId}`
      }))
      return false
    }
  }, [state.activeConversationId, loadConversations, state.pagination])

  // Start a new conversation
  const startConversation = useCallback(async (recipientId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await createConversation(recipientId)

      // Reload conversations and set this as active
      await loadConversations(1, state.pagination.itemsPerPage)
      setActiveConversation(response.id)

      return response.id
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to start conversation with ${recipientId}`
      }))
      return null
    }
  }, [loadConversations, setActiveConversation, state.pagination.itemsPerPage])

  // Change page for conversations
  const changePage = useCallback((page: number) => {
    loadConversations(page, state.pagination.itemsPerPage)
  }, [loadConversations, state.pagination.itemsPerPage])

  // Initial load of conversations
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    loadConversations,
    setActiveConversation,
    loadMessages,
    sendNewMessage,
    deleteChat,
    startConversation,
    changePage
  }
}
