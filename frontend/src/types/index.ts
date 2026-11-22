export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'agent' | 'user'
  is_active: boolean
  avatar_url?: string
  language: string
  timezone: string
  phone?: string
  last_login?: string
  created_at?: string
}

export interface Conversation {
  id: string
  user_id?: string
  agent_id?: string
  department_id?: string
  status: 'open' | 'closed' | 'pending' | 'archived'
  source: 'chat' | 'email' | 'whatsapp' | 'telegram' | 'messenger'
  subject?: string
  tags: string[]
  custom_data: Record<string, any>
  started_at?: string
  closed_at?: string
  last_message_at?: string
  queue_position?: number
  wait_time: number
  language: string
  user_name?: string
  agent_name?: string
  last_message_preview?: string
  unread_count: number
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  sender_type: 'user' | 'agent' | 'bot' | 'system'
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'emoji' | 'system'
  is_read: boolean
  created_at: string
  updated_at?: string
  attachments: any[]
  metadata: Record<string, any>
  sender_name?: string
}

export interface Ticket {
  id: string
  ticket_number: string
  user_id?: string
  agent_id?: string
  department_id?: string
  status: 'open' | 'pending' | 'solved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  subject: string
  description?: string
  category?: string
  created_at: string
  updated_at: string
  closed_at?: string
  user_name?: string
  agent_name?: string
}

export interface Article {
  id: string
  title: string
  content: string
  slug: string
  category_id?: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  views: number
  likes: number
  helpful: number
  not_helpful: number
  language: string
  created_at: string
  updated_at: string
  author_name?: string
  category_name?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  icon?: string
  display_order: number
  created_at: string
  subcategories?: Category[]
}

export interface Department {
  id: string
  name: string
  slug: string
  description?: string
  email?: string
  color: string
  display_order: number
  created_at: string
  agent_count: number
}

export interface AgentStats {
  agent_id: string
  agent_name: string
  total_conversations: number
  resolved_conversations: number
  avg_response_time: number
  avg_rating: number
  total_ratings: number
  online_status: 'online' | 'offline'
}

export interface DashboardStats {
  total_conversations: number
  open_conversations: number
  active_agents: number
  pending_tickets: number
  today_visitors: number
  today_conversations: number
  avg_response_time: number
  satisfaction_rate: number
  agent_stats: AgentStats[]
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

export interface ChatbotQnA {
  id: string
  question: string
  answer: string
  category?: string
}
