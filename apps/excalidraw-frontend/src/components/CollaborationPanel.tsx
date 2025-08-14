"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, Users, X, Send } from "lucide-react"
import { useSocket } from "../hooks/useSocket"
import type { WebSocketMessage } from "@repo/common/types"

interface ChatMessage {
  id: string
  message: string
  userId: string
  userName: string
  timestamp: number
}

interface CollaborationPanelProps {
  roomId: string
}

export function CollaborationPanel({ roomId }: CollaborationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "users">("chat")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const { socket } = useSocket()

  useEffect(() => {
    if (socket) {
      const handleMessage = (event: MessageEvent) => {
        const message: WebSocketMessage = JSON.parse(event.data)

        if (message.type === "chat" && message.message) {
          const chatMessage: ChatMessage = {
            id: Date.now().toString(),
            message: message.message,
            userId: message.userId || "unknown",
            userName: message.userName || "Anonymous",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, chatMessage])
        }
      }

      socket.addEventListener("message", handleMessage)
      return () => socket.removeEventListener("message", handleMessage)
    }
  }, [socket])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !roomId) return

    const message: WebSocketMessage = {
      type: "chat",
      roomId,
      message: newMessage,
    }

    socket.send(JSON.stringify(message))
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow"
        title="Open collaboration panel"
      >
        <MessageCircle size={20} className="text-gray-600" />
      </button>
    )
  }

  return (
    <div className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-96">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === "chat" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageCircle size={16} className="inline mr-1" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === "users" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Users size={16} className="inline mr-1" />
            Users
          </button>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {activeTab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-48 max-h-64">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">{msg.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{msg.message}</div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="flex-1 p-4 min-h-48">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-3">Active Users</div>
            {users.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">No other users online</div>
            ) : (
              users.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-800">{user}</span>
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="Online" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
