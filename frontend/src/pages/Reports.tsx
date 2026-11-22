import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Star,
  Activity,
  Calendar,
} from 'lucide-react'
import { dashboardAPI } from '../services/api'
import type { ReportResponse, AgentStats } from '../types'

export default function Reports() {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    dashboardAPI.getReports().then(res => {
      setReport(res.data)
      setLoading(false)
    }).catch(() => {
      // Mock data
      setReport({
        chat_stats: {
          total_conversations: 1247,
          open_conversations: 23,
          closed_conversations: 1180,
          avg_response_time: 125,
          avg_resolution_time: 3600,
          customer_satisfaction: 4.3,
        },
        agent_stats: [
          { agent_id: '1', agent_name: 'Agent Smith', total_conversations: 340, resolved_conversations: 310, avg_response_time: 90, avg_rating: 4.5, total_ratings: 89, online_status: 'online' },
          { agent_id: '2', agent_name: 'Sarah Johnson', total_conversations: 290, resolved_conversations: 275, avg_response_time: 110, avg_rating: 4.7, total_ratings: 76, online_status: 'offline' },
        ] as AgentStats[],
        conversation_by_source: { chat: 650, email: 320, whatsapp: 180, telegram: 97 },
        conversation_by_department: { support: 580, sales: 340, billing: 200, technical: 127 },
        top_articles: [
          { id: '1', title: 'How to reset your password', views: 1250 },
          { id: '2', title: 'Getting started guide', views: 980 },
          { id: '3', title: 'Billing FAQ', views: 750 },
        ],
        daily_stats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
          conversations: Math.floor(Math.random() * 50) + 10,
          closed: Math.floor(Math.random() * 40) + 5,
        })),
      })
      setLoading(false)
    })
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = report?.chat_stats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analytics and performance insights
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total_conversations || 0}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">+12% from last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.avg_response_time || 0}s</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">-8s from last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.customer_satisfaction || 0}/5</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Based on ratings</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{report?.agent_stats?.length || 0}</p>
              <div className="flex items-center gap-1 mt-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">{report?.agent_stats?.filter(a => a.online_status === 'online').length || 0} online</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Conversations Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Daily Conversations
          </h2>
          <div className="flex items-end gap-1 h-48">
            {report?.daily_stats.slice(-14).map((day: any) => {
              const maxConvs = Math.max(...report.daily_stats.map((d: any) => d.conversations))
              const height = (day.conversations / maxConvs) * 100
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary-500 dark:bg-primary-600 rounded-t transition-all hover:bg-primary-600 dark:hover:bg-primary-500"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${day.conversations} conversations`}
                  />
                  <span className="text-[10px] text-gray-400 hidden sm:block">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversations by Source */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            By Source
          </h2>
          <div className="space-y-4">
            {report?.conversation_by_source && Object.entries(report.conversation_by_source).map(([source, count]) => {
              const total = Object.values(report.conversation_by_source).reduce((a: number, b: number) => a + b, 0)
              const percentage = ((count as number) / total) * 100
              const colors: Record<string, string> = {
                chat: 'bg-blue-500',
                email: 'bg-yellow-500',
                whatsapp: 'bg-green-500',
                telegram: 'bg-purple-500',
              }
              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{source}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${colors[source] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Agent</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Conversations</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Resolved</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Avg Response</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Rating</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {report?.agent_stats.map(agent => (
                <tr key={agent.agent_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                          {agent.agent_name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.agent_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{agent.total_conversations}</td>
                  <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">{agent.resolved_conversations}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{agent.avg_response_time}s</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{agent.avg_rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${agent.online_status === 'online' ? 'badge-success' : 'badge-gray'}`}>
                      {agent.online_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Articles */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Knowledge Base Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report?.top_articles?.map((article, i) => (
            <div key={article.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{article.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
