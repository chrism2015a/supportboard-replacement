import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  MessageSquare,
  Mail,
  Send,
  Phone,
} from 'lucide-react'
import { conversationsAPI } from '../services/api'
import type { Conversation } from '../types'
import { formatDistanceToNow } from 'date-fns'

const sourceIcons: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  email: Mail,
  whatsapp: Send,
  telegram: Phone,
  messenger: MessageSquare,
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await conversationsAPI.list({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        page_size: 20,
      })
      setConversations(res.data.conversations || [])
      setTotal(res.data.total || 0)
    } catch (error) {
      // Use mock data if API fails
      setConversations([
        {
          id: '1',
          user_id: 'user1',
          agent_id: 'agent1',
          status: 'open',
          source: 'chat',
          subject: 'How do I reset my password?',
          tags: ['help', 'account'],
          custom_data: {},
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          queue_position: 1,
          wait_time: 120,
          language: 'en',
          user_name: 'John Doe',
          agent_name: 'Agent Smith',
          last_message_preview: 'I need help with...',
          unread_count: 2,
        },
        {
          id: '2',
          user_id: 'user2',
          status: 'pending',
          source: 'email',
          subject: 'Billing question',
          tags: ['billing'],
          custom_data: {},
          started_at: new Date(Date.now() - 3600000).toISOString(),
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          queue_position: undefined,
          wait_time: 0,
          language: 'en',
          user_name: 'Jane Smith',
          last_message_preview: 'Can I get a refund?',
          unread_count: 0,
        },
        {
          id: '3',
          user_id: 'user3',
          agent_id: 'agent1',
          status: 'closed',
          source: 'whatsapp',
          subject: 'Product inquiry',
          tags: ['sales'],
          custom_data: {},
          started_at: new Date(Date.now() - 86400000).toISOString(),
          last_message_at: new Date(Date.now() - 43200000).toISOString(),
          closed_at: new Date(Date.now() - 43200000).toISOString(),
          queue_position: undefined,
          wait_time: 0,
          language: 'en',
          user_name: 'Bob Wilson',
          agent_name: 'Agent Smith',
          last_message_preview: 'Thanks for your help!',
          unread_count: 0,
        },
      ])
      setTotal(3)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchConversations, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, page])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (status === 'closed') {
        await conversationsAPI.close(id)
      } else {
        await conversationsAPI.update(id, { status })
      }
      fetchConversations()
    } catch (error) {
      console.error(error)
    }
  }

  const statusConfig = {
    open: { label: 'Open', badge: 'badge-primary', icon: Clock },
    pending: { label: 'Pending', badge: 'badge-warning', icon: MinusCircle },
    closed: { label: 'Closed', badge: 'badge-success', icon: CheckCircle },
    archived: { label: 'Archived', badge: 'badge-gray', icon: XCircle },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all customer conversations
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conv) => {
              const StatusIcon = statusConfig[conv.status]?.icon || Clock
              const StatusBadge = statusConfig[conv.status]?.badge || 'badge-gray'
              const StatusLabel = statusConfig[conv.status]?.label || conv.status
              const SourceIcon = sourceIcons[conv.source] || MessageSquare

              return (
                <Link
                  key={conv.id}
                  to={`/conversations/${conv.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors block"
                >
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                      {conv.user_name?.charAt(0) || 'U'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conv.user_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {conv.agent_name && `→ ${conv.agent_name}`}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="badge badge-primary">{conv.unread_count} new</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.last_message_preview || conv.subject || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <SourceIcon className="w-3 h-3" />
                        {conv.source}
                      </span>
                      {conv.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-gray">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${StatusBadge}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {StatusLabel}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStatusChange(conv.id, 'closed')
                      }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
