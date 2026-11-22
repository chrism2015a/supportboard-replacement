import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Conversations from './pages/Conversations'
import Tickets from './pages/Tickets'
import KnowledgeBase from './pages/KnowledgeBase'
import Agents from './pages/Agents'
import Chatbot from './pages/Chatbot'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Chat from './pages/Chat'
import { AdminLayout } from './layouts/AdminLayout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<Chat />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="agents" element={<Agents />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
