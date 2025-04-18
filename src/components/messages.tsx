import { useState, useEffect } from 'react'
import { FiChevronLeft, FiSend, FiPaperclip, FiChevronDown, FiChevronUp, FiTrash2, FiAlertTriangle, FiSearch, FiChevronRight } from 'react-icons/fi'
import { mockConversations, mockMessages, MessageType } from '../data/mock/conversations'

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [mobileChatVisible, setMobileChatVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredConversations, setFilteredConversations] = useState(mockConversations)
  
  // Create conversation modal state
  const [isCreateConversationOpen, setIsCreateConversationOpen] = useState(false)
  const [newConversationUsername, setNewConversationUsername] = useState('')
  
  // Pagination state for conversations
  const [currentPage, setCurrentPage] = useState(1)
  const [conversationsPerPage, setConversationsPerPage] = useState(10)
  const [totalConversations, setTotalConversations] = useState(filteredConversations.length)
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredConversations.length / conversationsPerPage)
  
  // Get current page conversations
  const indexOfLastConversation = currentPage * conversationsPerPage
  const indexOfFirstConversation = indexOfLastConversation - conversationsPerPage
  const currentConversations = filteredConversations.slice(indexOfFirstConversation, indexOfLastConversation)

  // Update filtered conversations when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search query is empty, show all conversations
      setFilteredConversations(mockConversations);
    } else {
      // Filter conversations based on username or message content
      const filtered = mockConversations.filter(conversation => {
        const userMatch = conversation.user.toLowerCase().includes(searchQuery.toLowerCase());
        const messageMatch = conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Also search in message content if the conversation is active
        let messageContentMatch = false;
        if (activeConversation && Number(activeConversation) === conversation.id) {
          const messagesForConversation = mockMessages[conversation.id as keyof typeof mockMessages];
          if (messagesForConversation) {
            messageContentMatch = messagesForConversation.some(msg => 
              msg.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        }
        
        return userMatch || messageMatch || messageContentMatch;
      });
      
      setFilteredConversations(filtered);
    }
    
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery, activeConversation]);

  // Update total conversations count when filtered conversations change
  useEffect(() => {
    setTotalConversations(filteredConversations.length);
  }, [filteredConversations]);

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

  // Handle search
  const handleSearch = () => {
    // The search is already handled by the useEffect above
    // This function is mainly for the search button click
    console.log('Searching for:', searchQuery)
  }

  // Handle creating a new conversation
  const handleCreateConversation = () => {
    if (newConversationUsername.trim()) {
      // In a real app, you would make an API call to create a new conversation with this user
      console.log('Creating new conversation with:', newConversationUsername)
      
      // For demo purposes, we'll mock creating a new conversation by adding it to the list
      const newConversation = {
        id: mockConversations.length + 1,
        user: newConversationUsername,
        avatar: '', // No avatar initially
        lastMessage: "New conversation",
        unread: false,
        time: 'Just now',
      };
      
      // Add the new conversation to the beginning of the list
      setFilteredConversations([newConversation, ...filteredConversations]);
      
      // Open the new conversation
      setActiveConversation(String(newConversation.id));
      setMobileChatVisible(true);
      
      // Reset the form and close the modal
      setNewConversationUsername('');
      setIsCreateConversationOpen(false);
    }
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <h2 className="text-3xl font-bold mb-4">Messages</h2>
      
      <div className="flex flex-1 border-2 border-foreground/10 rounded-lg overflow-hidden">
        {/* Conversation List - hidden on mobile when a chat is open */}
        <div className={`w-full md:w-1/3 border-r-2 border-foreground/10 bg-background-light ${mobileChatVisible ? 'hidden md:block' : 'block'}`}>
          <div className="h-16 flex items-center px-4 border-b-2 border-foreground/10 justify-between">
            <h3 className="text-lg font-bold">Conversations</h3>
            <button 
              onClick={() => setIsCreateConversationOpen(true)}
              className="px-5 py-2 rounded-md bg-foreground text-background flex items-center gap-2 text-sm font-medium hover:bg-foreground/80 transition-colors shadow-sm"
            >
              <span>New Chat</span>
            </button>
          </div>
          
          {/* Search bar */}
            <div className="px-4 py-3 border-b-2 border-foreground/10">
            <div className="relative">
              <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md text-black outline-none focus:outline-none focus:border-foreground/10"
              />
              <button 
              onClick={handleSearch}
              className="absolute right-0 top-0 h-full px-4 rounded-r-md bg-foreground text-background flex items-center justify-center"
              aria-label="Search"
              >
              <FiSearch />
              </button>
            </div>
            </div>
          
          <div className="overflow-y-auto h-[calc(100%-11rem)]">
            {currentConversations.map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => openConversation(String(conversation.id))}
                className={`p-4 border-b-2 border-foreground/5 hover:bg-background-dark/10 cursor-pointer ${
                  activeConversation === String(conversation.id) ? 'bg-background-dark/20' : ''
                }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                   {conversation.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{conversation.user}</h4>
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
                <FiChevronRight />
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
                      ) : message.type === MessageType.Attachment && 'fileUrl' in message ? (
                        ((message: any) => {
                          const url: string = message.fileUrl;
                          return /\.(jpe?g|png|gif|webp)$/i.test(url) ? (
                            <img src={url} alt={message.content} className="max-w-full h-auto rounded-lg" />
                          ) : (
                            <a
                              href={url}
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
                          );
                        })(message)
                      ) : null}
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

      {/* Create Conversation Modal */}
      {isCreateConversationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-foreground/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Start a New Conversation</h3>
            
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
              </label>
              <input 
              type="text"
              id="username"
              placeholder="Enter username"
              value={newConversationUsername}
              onChange={(e) => setNewConversationUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
              className="w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md text-black outline-none focus:outline-none focus:border-foreground/10"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsCreateConversationOpen(false)}
                className="px-4 py-2 border-2 border-foreground/10 rounded-md hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90"
                disabled={!newConversationUsername.trim()}
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}