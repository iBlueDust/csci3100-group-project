import { useState } from 'react'
import { FiSend, FiMoreVertical, FiChevronLeft, FiTrash2, FiPlus } from 'react-icons/fi'

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    user: 'jade_collector',
    avatar: '',
    lastMessage: "I'm interested in your jade pendant",
    unread: true,
    time: '2h ago',
  },
  {
    id: 2,
    user: 'antique_lover',
    avatar: '',
    lastMessage: 'Is the price negotiable?',
    unread: false,
    time: '1d ago',
  },
  {
    id: 3,
    user: 'treasure_hunter',
    avatar: '',
    lastMessage: 'Thanks for the quick delivery!',
    unread: false,
    time: '3d ago',
  },
  {
    id: 4,
    user: 'gem_specialist',
    avatar: '',
    lastMessage: 'Do you have any more items like this?',
    unread: true,
    time: '1w ago',
  },
]

// Mock message history
const mockMessages: Record<number, { id: number; sender: string; text: string; time: string; }[]> = {
  1: [
    { id: 1, sender: 'jade_collector', text: 'Hello, I saw your jade pendant listing. Is it still available?', time: '2 hours ago' },
    { id: 2, sender: 'me', text: "Yes, it's still available!", time: '2 hours ago' },
    { id: 3, sender: 'jade_collector', text: "Great! I'm interested in buying it. Can you tell me more about its history?", time: '2 hours ago' },
    { id: 4, sender: 'me', text: 'Of course! This pendant is from the Ming Dynasty period and has been authenticated by experts.', time: '1 hour ago' },
    { id: 5, sender: 'jade_collector', text: "I'm interested in your jade pendant. Would you consider $50 less than your asking price?", time: '1 hour ago' },
  ],
  2: [
    { id: 1, sender: 'antique_lover', text: "Hi there, I'm interested in your vintage item.", time: '1 day ago' },
    { id: 2, sender: 'me', text: 'Hello! Thanks for your interest.', time: '1 day ago' },
    { id: 3, sender: 'antique_lover', text: 'Is the price negotiable?', time: '1 day ago' },
    { id: 4, sender: 'me', text: "I can offer a 5% discount if you're seriously interested.", time: '1 day ago' },
  ],
  3: [
    { id: 1, sender: 'me', text: 'Your package has been shipped! Tracking: JT123456', time: '4 days ago' },
    { id: 2, sender: 'treasure_hunter', text: 'Got it, thank you!', time: '3 days ago' },
    { id: 3, sender: 'treasure_hunter', text: 'Just received the package. Thanks for the quick delivery!', time: '3 days ago' },
  ],
  4: [
    { id: 1, sender: 'gem_specialist', text: 'The quality of your jade items is impressive.', time: '1 week ago' },
    { id: 2, sender: 'me', text: 'Thank you! I try to ensure all items are of the highest quality.', time: '1 week ago' },
    { id: 3, sender: 'gem_specialist', text: 'Do you have any more items like this?', time: '1 week ago' },
  ],
};

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [conversations, setConversations] = useState(mockConversations)
  const [mobileChatVisible, setMobileChatVisible] = useState(false)
  const [newChatVisible, setNewChatVisible] = useState(false)
  const [newChatUser, setNewChatUser] = useState('')
  const [newChatMessage, setNewChatMessage] = useState('')

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return

    console.log('Sending message:', messageInput)
    setMessageInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const openConversation = (id: number) => {
    setActiveConversation(id)
    setMobileChatVisible(true)
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === id ? { ...conv, unread: false } : conv
      )
    )
  }

  const handleDeleteChat = (id: number) => {
    console.log('Deleting chat with ID:', id)
    setConversations(conversations.filter((conv) => conv.id !== id))
    if (activeConversation === id) {
      setActiveConversation(null)
    }
  }

  const handleCreateChat = () => {
    if (!newChatUser.trim() || !newChatMessage.trim()) return

    // Generate a unique id (using max id + 1)
    const newId = Math.max(...conversations.map(c => c.id)) + 1
    const newConversation = {
      id: newId,
      user: newChatUser.trim(),
      avatar: '',
      lastMessage: newChatMessage.trim(),
      unread: false,
      time: 'Just now',
    }
    setConversations([newConversation, ...conversations])

    // Optionally, add an initial message to the mockMessages (in a real app, this would be done via an API)
    mockMessages[newId] = [
      { id: 1, sender: 'me', text: newChatMessage.trim(), time: 'Just now' },
    ]
    setNewChatUser('')
    setNewChatMessage('')
    setNewChatVisible(false)
    openConversation(newId)
  }

  const activeConv = conversations.find((c) => c.id === activeConversation)

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <h2 className="text-3xl font-bold mb-4">Messages</h2>

      <div className="flex flex-1 border border-foreground/10 rounded-lg overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-foreground/10 bg-background-light ${mobileChatVisible ? 'hidden md:block' : 'block'}`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-foreground/10">
            <h3 className="text-lg font-bold">Conversations</h3>
            <button onClick={() => setNewChatVisible(!newChatVisible)} className="text-foreground/70 hover:text-foreground">
              <FiPlus size={20} />
            </button>
          </div>

          {/* New Chat Form */}
          {newChatVisible && (
            <div className="px-4 py-2 border-b border-foreground/10">
              <input
                type="text"
                placeholder="Username"
                value={newChatUser}
                onChange={(e) => setNewChatUser(e.target.value)}
                className="w-full mb-2 rounded-md border border-foreground/20 px-3 py-2 bg-background"
              />
              <textarea
                placeholder="Type your message..."
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                rows={2}
                className="w-full mb-2 rounded-md border border-foreground/20 px-3 py-2 bg-background resize-none"
              />
              <button onClick={handleCreateChat} className="w-full bg-blue-500 text-white py-2 rounded-md">
                Create Chat
              </button>
            </div>
          )}

          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => openConversation(conversation.id)}
                className={`p-4 border-b border-foreground/5 cursor-pointer hover:bg-background-dark/30 transition-colors ${
                  activeConversation === conversation.id ? 'bg-background-dark/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                    {conversation.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-medium truncate">{conversation.user}</h4>
                      <span className="text-xs text-foreground/70">{conversation.time}</span>
                    </div>
                    <p className={`text-sm truncate ${conversation.unread ? 'font-bold' : 'text-foreground/70'}`}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChat(conversation.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col ${!mobileChatVisible ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden text-foreground/70"
                    onClick={() => setMobileChatVisible(false)}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                    {activeConv?.user.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-medium">
                    {activeConv?.user}
                  </h3>
                </div>
                <button className="text-foreground/70">
                  <FiMoreVertical size={20} />
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages[activeConversation as keyof typeof mockMessages]?.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'me' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-background-dark'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-foreground/50'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-foreground/10">
                <div className="flex items-center gap-2">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border border-foreground/20 bg-background px-3 py-2 min-h-[2.5rem] max-h-[10rem] resize-none"
                    rows={1}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50"
                    disabled={!messageInput.trim()}
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-foreground/50">
              <div className="text-center">
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}