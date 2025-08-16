"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { Plus, Users, Clock, Settings } from "lucide-react"

interface Room {
  id: number
  slug: string
  createdAt: string
  admin: {
    name: string
    id: string
  }
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin")
    }
  }, [user, loading, router])

  const createRoom = async () => {
    if (!newRoomName.trim()) return

    setIsCreating(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("https://http-1zv7.onrender.com/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`https://excalidraw-whiteboard-tawny.vercel.app?room=${data.roomId}`)
      }
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setIsCreating(false)
      setNewRoomName("")
    }
  }

  const joinRoom = () => {
    const roomId = prompt("Enter room ID:")
    if (roomId) {
      router.push(`https://excalidraw-whiteboard-tawny.vercel.app?room=${roomId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-pulse w-8 h-8 bg-primary rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Excalidraw Clone</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Welcome, {user.name}</span>
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Whiteboards</h2>
          <p className="text-muted-foreground">Create and manage your collaborative whiteboards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center min-h-48 hover:border-primary transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Create New Whiteboard</h3>
            <div className="w-full space-y-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Whiteboard name"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyPress={(e) => e.key === "Enter" && createRoom()}
              />
              <button
                onClick={createRoom}
                disabled={isCreating || !newRoomName.trim()}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium button-hover disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border border-border p-6 flex flex-col items-center justify-center min-h-48 hover:shadow-md transition-shadow cursor-pointer"
            onClick={joinRoom}
          >
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Join Whiteboard</h3>
            <p className="text-muted-foreground text-sm text-center">Enter a room ID to join an existing whiteboard</p>
          </div>
        </div>

        {rooms.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Recent Whiteboards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`https://excalidraw-whiteboard-tawny.vercel.app?room=${room.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground truncate">{room.slug}</h4>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(room.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
