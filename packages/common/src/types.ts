import { z } from "zod"

export const CreateUserSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export const SigninSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
})

export const CreateRoomSchema = z.object({
  name: z.string().min(1),
})

export type CreateUserType = z.infer<typeof CreateUserSchema>
export type SigninType = z.infer<typeof SigninSchema>
export type CreateRoomType = z.infer<typeof CreateRoomSchema>

// Whiteboard types
export interface DrawingElement {
  id: string
  type:
    | "select"
    | "hand"
    | "rectangle"
    | "diamond"
    | "circle"
    | "arrow"
    | "line"
    | "pencil"
    | "text"
    | "image"
    | "eraser"
    | "laser"
  x: number
  y: number
  width?: number
  height?: number
  points?: { x: number; y: number }[]
  strokeColor: string
  strokeWidth: number
  fillColor: string
  strokeStyle?: "solid" | "dashed" | "dotted"
  text?: string
  imageData?: string
  userId?: string // Made optional to fix TypeScript errors
  timestamp?: number // Made optional to fix TypeScript errors
}

export interface WebSocketMessage {
  type: "join_room" | "leave_room" | "drawing_update" | "drawing_delete" | "cursor_move" | "chat" | "room_state"
  roomId: string
  userId?: string
  element?: DrawingElement
  elementId?: string
  cursor?: { x: number; y: number; userId: string }
  message?: string
  elements?: DrawingElement[]
}
