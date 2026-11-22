import { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Smile,
  Minimize2,
  Maximize2,
  Bot,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Globe,
  Search,
  ExternalLink,
  ArrowRight,
  Check,
  MessageSquare,
} from 'lucide-react'

interface ChatWidgetProps {
  widgetId?: string
  themeColor?: string
  welcomeMessage?: string
  position?: 'bottom-right' | 'bottom-left'
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  isTyping?: boolean
}

interface KBArticle {
  id: string
  title: string
  content: string
  preview: string
}

// Default Q&A for chatbot
const defaultQnA: Record<string, string> = {
  'hello': "Hi there! 👋 How can I help you today?",
  'hi': "Hello! Welcome to our support chat. What can I assist you with?",
  'help': "I'm here to help! You can ask me about:\n• Account issues\n• Billing questions\n• Product features\n• Technical support",
  'hours': "We're available 24/7! Our chatbot is always online, and human agents are available 9 AM - 6 PM EST.",
  'pricing': "Check out our pricing page for detailed plans. We offer free, pro, and enterprise plans to fit your needs.",
  'password': "To reset your password:\n1. Click 'Forgot Password' on the login page\n2. Enter your email\n3. Follow the link in the email\nNeed more help?",
  'refund': "For refund requests, please contact our billing team at billing@example.com or open a ticket.",
  'contact': "You can reach us through:\n• Live Chat (right here!)\n• Email: support@example.com\n• Phone: 1-800-123-4567",
  'thank': "You're welcome! 😊 Is there anything else I can help with?",
}

// Sample knowledge base articles
const sampleArticles: KBArticle[] = [
  { id: '1', title: 'Getting Started Guide', content: 'Welcome to our platform! This guide will help you get started.', preview: 'Learn how to set up your account...' },
  { id: '2', title: 'How to Reset Password', content: 'Step-by-step guide to resetting your password.', preview: 'Click on "Forgot Password"...' },
  { id: '3', title: 'Billing FAQ', content: 'Common billing questions and answers.', preview: 'Find answers to billing questions...' },
]

export default function ChatWidget({
  widgetId = 'default',
  themeColor = '#3b82f6',
  welcomeMessage = "Hi there! 👋 How can we help you?",
  position = 'bottom-right',
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showKB, setShowKB] = useState(false)
  const [kbSearch, setKBSearch] = useState('')
  const [language, setLanguage] = useState('en')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {}

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Show welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isMinimized) {
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date(),
        }])
      }, 300)
    }
  }, [isOpen])

  const findBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase()

    // Check exact matches first
    for (const [key, value] of Object.entries(defaultQnA)) {
      if (lower.includes(key)) return value
    }

    // Check knowledge base
    for (const article of sampleArticles) {
      if (article.title.toLowerCase().includes(lower) || lower.includes(article.title.toLowerCase())) {
        return `Here's a helpful article: **${article.title}**\n\n${article.preview}`
      }
    }

    // Default fallback
    return "I'm not sure I understand. Could you rephrase that? You can also:\n• Browse our Knowledge Base\n• Connect with a human agent\n• Check our FAQ"
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: String(Date.now()),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const response = findBotResponse(input)
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
      }])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredArticles = sampleArticles.filter(a =>
    a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
    a.preview.toLowerCase().includes(kbSearch.toLowerCase())
  )

  const emojis = ['😀', '😃', '😊', '👍', '❤️', '🎉', '🙏', '✨', '🔥', '💯']

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => {
          if (isMinimized) {
            setIsMinimized(false)
          }
          setIsOpen(!isOpen)
        }}
        className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110`}
        style={{ backgroundColor: themeColor }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
            1
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-24 z-50 w-[380px] sm:w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up`}
          style={{ animationDuration: '0.3s' }}
        >
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Support Bot</h3>
                <div className="flex items-center gap-1 text-xs text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKB(!showKB)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Knowledge Base"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Minimize"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* KB Panel */}
          {showKB && !isMinimized && (
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Knowledge Base
              </h4>
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKBSearch(e.target.value)}
                placeholder="Search articles..."
                className="input text-sm mb-3"
              />
              <div className="space-y-2">
                {filteredArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: String(Date.now()),
                        content: `📄 **${article.title}**: ${article.preview}`,
                        sender: 'bot',
                        timestamp: new Date(),
                      }])
                      setShowKB(false)
                      setKBSearch('')
                    }}
                    className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['How can you help?', 'Pricing', 'Support', 'Features'].map(action => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action)
                      setTimeout(() => handleSend(), 100)
                    }}
                    className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            {/* Emoji Picker */}
            <div className="flex gap-1 mb-2 overflow-x-auto pb-2 scrollbar-thin">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setInput(input + emoji)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg flex-shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="input flex-1 min-h-[40px] max-h-[80px] resize-none text-sm"
                rows={1}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-full transition-all disabled:opacity-50 hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: input.trim() ? themeColor : '#e5e7eb' }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-transparent text-gray-500 dark:text-gray-400 border-none p-0 focus:outline-none cursor-pointer"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                </select>
              </div>
              <span className="text-[10px] text-gray-400">
                Powered by Support Board
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export as global function for embedding
export function initChatWidget(options?: Partial<ChatWidgetProps>) {
  const container = document.createElement('div')
  container.id = 'sb-widget-root'
  document.body.appendChild(container)
  return container
}
