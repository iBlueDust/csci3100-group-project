import { useState, useEffect } from 'react'
import { FiChevronLeft, FiSend, FiPaperclip, FiChevronDown, FiChevronUp, FiTrash2, FiAlertTriangle } from 'react-icons/fi'

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    user: 'jade_collector',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: "I'm interested in your jade pendant",
    unread: true,
    time: '2h ago',
    wasRequestedToDelete: false,
  },
  {
    id: 2,
    user: 'antique_lover',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    lastMessage: 'Is the price negotiable?',
    unread: false,
    time: '1d ago',
    wasRequestedToDelete: true,
  },
  {
    id: 3,
    user: 'treasure_hunter',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    lastMessage: 'Thanks for the quick delivery!',
    unread: false,
    time: '3d ago',
  },
  {
    id: 4,
    user: 'gem_specialist',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    lastMessage: 'Do you have any more items like this?',
    unread: true,
    time: '1w ago',
  },
]

// Message types
enum MessageType {
  Text = 'text',
  Attachment = 'attachment',
}

// Mock message history
const mockMessages = {
  1: [
    { id: 1, sender: 'jade_collector', type: MessageType.Text, content: 'Hello, I saw your jade pendant listing. Is it still available?', time: '2 hours ago' },
    { id: 2, sender: 'me', type: MessageType.Text, content: "Yes, it's still available!", time: '2 hours ago' },
    { id: 3, sender: 'jade_collector', type: MessageType.Text, content: "Great! I'm interested in buying it. Can you tell me more about its history?", time: '2 hours ago' },
    { id: 4, sender: 'me', type: MessageType.Text, content: 'Of course! This pendant is from the Ming Dynasty period and has been authenticated by experts.', time: '1 hour ago' },
    { 
      id: 5, 
      sender: 'me', 
      type: MessageType.Attachment, 
      content: 'certificate-of-authenticity.pdf', 
      fileUrl: 'https://example.com/files/certificate.pdf',
      time: '1 hour ago' 
    },
    { id: 6, sender: 'jade_collector', type: MessageType.Text, content: "I'm interested in your jade pendant. Would you consider $50 less than your asking price?", time: '1 hour ago' },
  ],
  2: [
    { id: 1, sender: 'antique_lover', type: MessageType.Text, content: "Hi there, I'm interested in your vintage item.", time: '1 day ago' },
    { id: 2, sender: 'me', type: MessageType.Text, content: 'Hello! Thanks for your interest.', time: '1 day ago' },
    { id: 3, sender: 'antique_lover', type: MessageType.Text, content: 'Is the price negotiable?', time: '1 day ago' },
    { id: 4, sender: 'me', type: MessageType.Text, content: "I can offer a 5% discount if you're seriously interested.", time: '1 day ago' },
  ],
  3: [
    { id: 1, sender: 'me', type: MessageType.Text, content: 'Your package has been shipped! Tracking: JT123456', time: '4 days ago' },
    { 
      id: 2, 
      sender: 'me', 
      type: MessageType.Attachment, 
      content: 'shipping_receipt.pdf', 
      fileUrl: 'https://example.com/files/receipt.pdf', 
      time: '4 days ago' 
    },
    { id: 3, sender: 'treasure_hunter', type: MessageType.Text, content: 'Got it, thank you!', time: '3 days ago' },
    { id: 4, sender: 'treasure_hunter', type: MessageType.Text, content: 'Just received the package. Thanks for the quick delivery!', time: '3 days ago' },
  ],
  4: [
    { id: 1, sender: 'gem_specialist', type: MessageType.Text, content: 'The quality of your jade items is impressive.', time: '1 week ago' },
    { id: 2, sender: 'me', type: MessageType.Text, content: 'Thank you! I try to ensure all items are of the highest quality.', time: '1 week ago' },
    { 
      id: 3, 
      sender: 'gem_specialist', 
      type: MessageType.Attachment, 
      content: 'jade_inquiry.jpg',
      fileUrl: 'https://example.com/files/jade_photo.jpg', 
      time: '1 week ago' 
    },
    { id: 4, sender: 'gem_specialist', type: MessageType.Text, content: 'Do you have any more items like this?', time: '1 week ago' },
  ],
}

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [mobileChatVisible, setMobileChatVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)
  
  // Pagination state for conversations
  const [currentPage, setCurrentPage] = useState(1)
  const [conversationsPerPage, setConversationsPerPage] = useState(10)
  const [totalConversations, setTotalConversations] = useState(mockConversations.length)
  
  // Calculate total pages
  const totalPages = Math.ceil(mockConversations.length / conversationsPerPage)
  
  // Get current page conversations
  const indexOfLastConversation = currentPage * conversationsPerPage
  const indexOfFirstConversation = indexOfLastConversation - conversationsPerPage
  const currentConversations = mockConversations.slice(indexOfFirstConversation, indexOfLastConversation)

  const openConversation = (id: string) => {
    setActiveConversation(id)
    setMobileChatVisible(true)
  }

  const handleSend = () => {
    if (message.trim() || attachment) {
      if (attachment) {
        console.log('Sending attachment:', attachment.name, 'File size:', attachment.size)
        // In a real app, you would upload the file to a server here
      }
      if (message.trim()) {
        console.log('Sending message:', message)
      }
      
      // Reset inputs
      setMessage('')
      setAttachment(null)
      setShowAttachmentPreview(false)
    }
  }
  
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachment(file)
      setShowAttachmentPreview(true)
    }
  }
  
  const cancelAttachment = () => {
    setAttachment(null)
    setShowAttachmentPreview(false)
  }
  
  // Change page
  const changePage = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  // Handle delete chat
  const handleDeleteChat = () => {
    if (activeConversation && window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      // In a real app, we would make an API call to delete the chat
      // For this mock, we'll just close the active conversation
      setActiveConversation(null)
      setMobileChatVisible(false)
      
      // In a real implementation, we would also need to remove the conversation from the list
      // For now, we'll just leave it in the list since we're using mock data
      console.log(`Deleted conversation: ${activeConversation}`)
    }
  }

  // For demo purposes - toggle deletion status
  const toggleChatDeletionStatus = (id: string) => {
    // In a real app, this would be read-only data from the API
    // This is just to demonstrate the UI behavior
    const conversation = mockConversations.find(c => c.id === Number(id));
    if (conversation) {
      conversation.wasRequestedToDelete = !conversation.wasRequestedToDelete;
      // Force re-render
      setActiveConversation(null);
      setTimeout(() => setActiveConversation(id), 10);
    }
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <h2 className="text-3xl font-bold mb-4">Messages</h2>
      
      <div className="flex flex-1 border-2 border-foreground/10 rounded-lg overflow-hidden">
        {/* Conversation List - hidden on mobile when a chat is open */}
        <div className={`w-full md:w-1/3 border-r-2 border-foreground/10 bg-background-light ${mobileChatVisible ? 'hidden md:block' : 'block'}`}>
          <div className="h-16 flex items-center px-4 border-b-2 border-foreground/10">
            <h3 className="text-lg font-bold">Conversations</h3>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-7rem)]">
            {currentConversations.map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => openConversation(String(conversation.id))}
                className={`p-4 border-b-2 border-foreground/5 hover:bg-background-dark/10 cursor-pointer ${
                  activeConversation === String(conversation.id) ? 'bg-background-dark/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                    {conversation.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium">{conversation.user}</h4>
                    <p className="text-sm text-foreground/70 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination controls for conversations */}
          <div className="h-12 flex items-center justify-center border-t-2 border-foreground/10">
            <div className="flex items-center">
              <button 
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 ${currentPage === 1 ? 'text-foreground/30 cursor-not-allowed' : 'text-foreground/70 hover:text-foreground'}`}
              >
                <FiChevronLeft />
              </button>
              
              <span className="mx-2 text-sm">
                {indexOfFirstConversation + 1}-{Math.min(indexOfLastConversation, mockConversations.length)} of {mockConversations.length}
              </span>
              
              <button 
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 ${currentPage === totalPages ? 'text-foreground/30 cursor-not-allowed' : 'text-foreground/70 hover:text-foreground'}`}
              >
                <FiChevronDown />
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col ${!mobileChatVisible ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b-2 border-foreground/10">
                <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden text-foreground/70"
                    onClick={() => setMobileChatVisible(false)}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                    {mockConversations.find(c => c.id === Number(activeConversation))?.user.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-medium">
                    {mockConversations.find(c => c.id === Number(activeConversation))?.user}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 hover:text-red-500 transition-colors" 
                    onClick={handleDeleteChat}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Deletion Banner */}
              {mockConversations.find(c => c.id === Number(activeConversation))?.wasRequestedToDelete && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800 flex items-center gap-2">
                  <FiAlertTriangle size={20} />
                  <div>
                    <p className="font-medium">This conversation has been deleted by the other person.</p>
                    <p className="text-sm">You can still view these messages, but they can no longer reply.</p>
                  </div>
                  
                  {/* For demo purposes only - this button would not exist in production */}
                  <button 
                    className="ml-auto text-xs text-amber-800 underline"
                    onClick={() => toggleChatDeletionStatus(activeConversation)}
                  >
                    Toggle Status (Demo)
                  </button>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages[Number(activeConversation) as keyof typeof mockMessages]?.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-xl px-4 py-2 ${
                        message.sender === 'me' 
                          ? 'bg-black text-white border-2 border-[#343434]' 
                          : 'bg-white text-black border-2 border-[#343434]'
                      }`}
                    >
                      {message.type === MessageType.Text ? (
                        <p>{message.content}</p>
                      ) : (
                        <a 
                          href={'fileUrl' in message ? message.fileUrl : '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:bg-foreground/10 p-2 rounded-lg transition-colors"
                        >
                          <div className="bg-foreground/5 p-2 rounded-lg">
                            <FiPaperclip size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="truncate">{message.content}</p>
                            <p className="text-xs text-foreground/70">Click to open</p>
                          </div>
                        </a>
                      )}
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-black/50'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t-2 border-foreground/10">
                {/* Attachment preview */}
                {showAttachmentPreview && attachment && (
                  <div className="mb-2 p-2 border-2 border-foreground/10 rounded-lg bg-background-dark/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-foreground/5 p-2 rounded-lg">
                        <FiPaperclip size={18} />
                      </div>
                      <div>
                        <p className="text-sm truncate">{attachment.name}</p>
                        <p className="text-xs text-foreground/70">{(attachment.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={cancelAttachment} 
                      className="text-foreground/70 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border-2 border-foreground/20 bg-background px-3 py-2 min-h-[2.5rem] max-h-[10rem] resize-none"
                    rows={1}
                  />
                  <label className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center cursor-pointer hover:bg-foreground/20 transition-colors">
                    <FiPaperclip size={18} />
                    <input 
                      type="file"
                      onChange={handleAttachmentChange} 
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={handleSend}
                    className="h-10 w-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center disabled:opacity-50 border-2 border-gray-200 dark:border-gray-700"
                    disabled={!message.trim() && !attachment}
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