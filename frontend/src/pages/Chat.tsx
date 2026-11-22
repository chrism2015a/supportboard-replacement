import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Tag,
  Star,
  Clock,
  Download,
  Users,
} from 'lucide-react'
import { messagesAPI, conversationsAPI } from '../services/api'
import type { Message, Conversation } from '../types'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'

// Simple emoji data
const emojis = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
  '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
  '❓', '❗', '💯', '💢', '💥', '💫', '💦', '🔥', '⭐', '🌟',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👋', '🤝',
]

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [typing, setTyping] = useState(false)

  const user = useAuthStore((s) => s.user)
  const agentId = user?.id || ''

  useEffect(() => {
    if (!id) return

    Promise.all([
      conversationsAPI.get(id).catch(() => ({ data: {} })),
      messagesAPI.list(id).catch(() => ({ data: [] })),
    ]).then(([convRes, msgsRes]) => {
      setConversation(convRes.data || {})
      setMessages(msgsRes.data || [
        // Mock messages for demo
        {
          id: '1',
          conversation_id: id,
          user_id: 'user1',
          sender_type: 'user',
          content: 'Hi, I need help with my account',
          type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 300000).toISOString(),
          sender_name: 'John Doe',
        },
        {
          id: '2',
          conversation_id: id,
          user_id: 'agent1',
          sender_type: 'agent',
          content: "Hello John! I'd be happy to help you with your account. What seems to be the issue?",
          type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 240000).toISOString(),
          sender_name: 'Agent Smith',
        },
        {
          id: '3',
          conversation_id: id,
          user_id: 'user1',
          sender_type: 'user',
          content: 'I can\'t login. It says my password is incorrect but I\'m sure it\'s right.',
          type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 180000).toISOString(),
          sender_name: 'John Doe',
        },
        {
          id: '4',
          conversation_id: id,
          user_id: 'agent1',
          sender_type: 'agent',
          content: 'I understand that\'s frustrating. Let me help you reset your password. Would you like me to send a reset link to your email?',
          type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 120000).toISOString(),
          sender_name: 'Agent Smith',
        },
        {
          id: '5',
          conversation_id: id,
          user_id: 'user1',
          sender_type: 'user',
          content: 'Yes, please! Thank you 😊',
          type: 'text',
          is_read: false,
          created_at: new Date(Date.now() - 60000).toISOString(),
          sender_name: 'John Doe',
        },
      ])
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return

    try {
      const response = await messagesAPI.send({
        conversation_id: id,
        sender_id: agentId,
        sender_type: 'agent',
        content: newMessage.trim(),
      })
      setMessages([...messages, response.data])
      setNewMessage('')
      setShowEmoji(false)
    } catch (error) {
      // Add mock message if API fails
      const mockMsg: Message = {
        id: String(Date.now()),
        conversation_id: id,
        user_id: agentId,
        sender_type: 'agent',
        content: newMessage.trim(),
        type: 'text',
        is_read: true,
        created_at: new Date().toISOString(),
        sender_name: user?.name || 'Agent',
      }
      setMessages([...messages, mockMsg])
      setNewMessage('')
      setShowEmoji(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && conversation) {
      if (!conversation.tags) {
        // Mock: just show toast
        toast.success(`Tag "${newTag}" added`)
      }
      setNewTag('')
      setShowTags(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/conversations')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {conversation?.user_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {conversation?.user_name || 'Customer'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{conversation?.source} • {conversation?.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowDetails(!showDetails)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Details">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50 dark:bg-gray-900">
          {messages.map((msg) => {
            const isAgent = msg.sender_type === 'agent'
            const isBot = msg.sender_type === 'bot'
            const isSystem = msg.sender_type === 'system'
            return (
              <div key={msg.id} className={`flex ${isAgent || isBot ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-md ${isAgent || isBot ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAgent ? 'bg-primary-600' : isBot ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <span className="text-xs font-bold text-white">
                      {msg.sender_name?.charAt(0) || '?'}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div className={`px-4 py-2 ${
                      isAgent || isBot
                        ? 'bg-primary-600 text-white rounded-2xl rounded-bl-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-br-sm shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isAgent ? 'text-right' : 'text-left'}`}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                      {!msg.is_read && isAgent && ' ✓✓'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typing && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Customer is typing...</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {/* Emoji Picker */}
          {showEmoji && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-slide-down">
              <div className="grid grid-cols-10 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(newMessage + emoji)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={`p-2 rounded-lg transition-colors ${showEmoji ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Attach file">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Voice message">
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="input flex-1 min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />

            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="btn btn-primary h-[40px] w-[40px] p-0 flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Conversation Details */}
      {showDetails && conversation && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conversation Info</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{conversation.user_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{conversation.source}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                <select
                  className="input mt-1"
                  value={conversation.status}
                  onChange={(e) => {
                    conversationsAPI.update(id!, { status: e.target.value as any })
                      .then(() => setConversation({ ...conversation, status: e.target.value as any }))
                      .catch(() => {})
                  }}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tags</label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {conversation.tags?.map(tag => (
                    <span key={tag} className="badge badge-primary">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() => setShowTags(!showTags)}
                  className="text-xs text-primary-600 dark:text-primary-400 mt-2 hover:underline"
                >
                  + Add tag
                </button>
                {showTags && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="New tag"
                      className="input text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button onClick={handleAddTag} className="btn btn-primary btn-sm">Add</button>
                  </div>
                )}
              </div>

              <button className="w-full btn btn-secondary btn-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Transfer Conversation
              </button>

              <button className="w-full btn btn-secondary btn-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Transcript
              </button>

              <button
                className="w-full btn btn-danger btn-sm flex items-center gap-2"
                onClick={() => {
                  conversationsAPI.close(id!)
                    .then(() => setConversation({ ...conversation, status: 'closed' }))
                    .catch(() => {})
                }}
              >
                <Users className="w-4 h-4" />
                Close Conversation
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              AI Smart Reply
            </h3>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "I understand your frustration. Let me help you with that right away."
              </p>
              <button className="text-xs text-primary-600 dark:text-primary-400 mt-2 hover:underline">
                Use this reply
              </button>
            </div>
          </div>

          {/* Agent Rating */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Rating</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="text-2xl hover:scale-110 transition-transform">
                  ⭐
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
