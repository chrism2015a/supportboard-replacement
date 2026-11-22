import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  conversationId: string
  token: string | null
  onMessage?: (data: any) => void
  enabled?: boolean
}

export function useWebSocket({ conversationId, token, onMessage, enabled = true }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!token || !enabled || !conversationId) return

    setIsConnecting(true)

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host || 'localhost:8000'
    const wsUrl = `${protocol}//${host}/ws/chat/${conversationId}?token=${token}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      setIsConnecting(false)
      reconnectAttempts.current = 0
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onMessage) {
          onMessage(data)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnecting(false)
    }

    ws.onclose = () => {
      setIsConnected(false)
      setIsConnecting(false)

      // Reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        reconnectAttempts.current++
        console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current})`)
        setTimeout(connect, delay)
      }
    }

    wsRef.current = ws
  }, [conversationId, token, enabled, onMessage])

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
    reconnectAttempts.current = 0
  }, [])

  useEffect(() => {
    if (enabled && conversationId && token) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, conversationId, token, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
  }
}
