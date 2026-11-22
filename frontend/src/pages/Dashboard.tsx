import { useState, useEffect } from 'react'
import {
  MessagesSquare,
  Clock,
  Users,
  Ticket,
  TrendingUp,
  Star,
  Activity,
} from 'lucide-react'
import { dashboardAPI, usersAPI } from '../services/api'
import type { DashboardStats } from '../../types'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.get().catch(() => ({ data: {} })),
      usersAPI.listAgents().catch(() => ({ data: [] })),
    ]).then(([statsRes, agentsRes]) => {
      setStats(statsRes.data)
      setAgents(agentsRes.data)
      setLoading(false)
    })
  }, [])

  const statCards = [
    {
      title: 'Total Conversations',
      value: stats?.total_conversations || 0,
      icon: MessagesSquare,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Open Conversations',
      value: stats?.open_conversations || 0,
      icon: Clock,
      color: 'yellow',
      change: '-5%',
    },
    {
      title: 'Active Agents',
      value: stats?.active_agents || 0,
      icon: Users,
      color: 'green',
      change: '+2',
    },
    {
      title: 'Pending Tickets',
      value: stats?.pending_tickets || 0,
      icon: Ticket,
      color: 'red',
      change: '+3',
    },
  ]

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-600 dark:text-yellow-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: 'text-green-600 dark:text-green-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: 'text-red-600 dark:text-red-400' },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of your support operations
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = colorClasses[card.color]
          const Icon = card.icon
          return (
            <div key={card.title} className="card p-6 animate-slide-up">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats?.avg_response_time || 0).toFixed(0)}s
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.satisfaction_rate || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Satisfaction</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <MessagesSquare className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.today_conversations || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Today's Chats</p>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Status
          </h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                      {agent.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {agent.total_conversations} chats
                    </p>
                  </div>
                </div>
                <span className={`badge ${agent.online_status === 'online' ? 'badge-success' : 'badge-gray'}`}>
                  {agent.online_status}
                </span>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No agents configured
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
