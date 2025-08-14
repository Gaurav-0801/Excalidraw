"use client"

import { useEffect, useState } from "react"

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    const ws = new WebSocket(`ws://localhost:8080?token=${token}`)

    ws.onopen = () => {
      console.log("WebSocket connected")
      setSocket(ws)
      setLoading(false)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setSocket(null)
      setLoading(false)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setLoading(false)
    }

    return () => {
      ws.close()
    }
  }, [])

  return { socket, loading }
}
