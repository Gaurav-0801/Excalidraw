"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Toolbar } from "./Toolbar"
import { PropertiesPanel } from "./PropertiesPanel"
import { ZoomControls } from "./ZoomControls"
import { CollaborationPanel } from "./CollaborationPanel"
import { useWhiteboardStore } from "../store/whiteboardStore"
import { drawElement, isPointInElement } from "../utils/drawing"
import { useSocket } from "../hooks/useSocket"
import type { WebSocketMessage, DrawingElement } from "@repo/common/types"

interface Cursor {
  x: number
  y: number
  userId: string
  userName: string
  color: string
}

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // Added file input ref for image upload
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [cursors, setCursors] = useState<Cursor[]>([])
  const [roomId, setRoomId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isEditingText, setIsEditingText] = useState(false)
  const [textEditPosition, setTextEditPosition] = useState({ x: 0, y: 0 })
  const [textEditElementId, setTextEditElementId] = useState<string | null>(null)
  const [textEditValue, setTextEditValue] = useState("")
  const [pendingImagePosition, setPendingImagePosition] = useState<{ x: number; y: number } | null>(null) // Added for image positioning
  const { socket } = useSocket()
  const searchParams = useSearchParams()

  const {
    elements,
    selectedTool,
    strokeColor,
    strokeWidth,
    fillColor,
    strokeStyle,
    zoom,
    panOffset,
    addElement,
    updateElement,
    deleteElement,
    setElements,
    setZoom,
    setPanOffset,
    selectedElementId,
    setSelectedElementId,
  } = useWhiteboardStore()

  useEffect(() => {
    const room = searchParams.get("room")
    if (room) {
      setRoomId(room)
    }
  }, [searchParams])

  useEffect(() => {
    if (socket && roomId && !isConnected) {
      const joinMessage: WebSocketMessage = {
        type: "join_room",
        roomId,
      }
      socket.send(JSON.stringify(joinMessage))
      setIsConnected(true)

      socket.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data)

        switch (message.type) {
          case "room_state":
            if (message.elements) {
              setElements(
                message.elements.map((el: any) => ({
                  id: el.id,
                  type: el.type,
                  x: el.x,
                  y: el.y,
                  width: el.width,
                  height: el.height,
                  points: el.points,
                  strokeColor: el.strokeColor,
                  strokeWidth: el.strokeWidth,
                  fillColor: el.fillColor,
                  strokeStyle: el.strokeStyle,
                  text: el.text,
                  imageData: el.imageData,
                })),
              )
            }
            break

          case "drawing_update":
            if (message.element) {
              const element = message.element
              addElement({
                id: element.id,
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                points: element.points,
                strokeColor: element.strokeColor,
                strokeWidth: element.strokeWidth,
                fillColor: element.fillColor,
                strokeStyle: element.strokeStyle,
                text: element.text,
                imageData: element.imageData,
              })
            }
            break

          case "drawing_delete":
            if (message.elementId) {
              deleteElement(message.elementId)
            }
            break

          case "cursor_move":
            if (message.cursor) {
              setCursors((prev) => {
                const filtered = prev.filter((c) => c.userId !== message.cursor!.userId)
                return [
                  ...filtered,
                  {
                    ...message.cursor!,
                    userName: message.cursor!.userId,
                    color: getUserColor(message.cursor!.userId),
                  },
                ]
              })
            }
            break
        }
      }
    }

    return () => {
      if (socket && roomId && isConnected) {
        const leaveMessage: WebSocketMessage = {
          type: "leave_room",
          roomId,
        }
        socket.send(JSON.stringify(leaveMessage))
        setIsConnected(false)
      }
    }
  }, [socket, roomId, isConnected, addElement, deleteElement, setElements])

  const getUserColor = (userId: string): string => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const broadcastElement = useCallback(
    (element: DrawingElement) => {
      if (socket && roomId) {
        const drawingElement: DrawingElement = {
          id: element.id,
          type: element.type,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          points: element.points,
          strokeColor: element.strokeColor,
          strokeWidth: element.strokeWidth,
          fillColor: element.fillColor,
          strokeStyle: element.strokeStyle,
          text: element.text,
          imageData: element.imageData,
          userId: "current-user", // This should come from auth context
          timestamp: Date.now(),
        }

        const message: WebSocketMessage = {
          type: "drawing_update",
          roomId,
          element: drawingElement,
        }
        socket.send(JSON.stringify(message))
      }
    },
    [socket, roomId],
  )

  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      if (socket && roomId) {
        const message: WebSocketMessage = {
          type: "cursor_move",
          roomId,
          cursor: {
            x,
            y,
            userId: "current-user", // This should come from auth context
          },
        }
        socket.send(JSON.stringify(message))
      }
    },
    [socket, roomId],
  )

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left - panOffset.x) / zoom,
        y: (clientY - rect.top - panOffset.y) / zoom,
      }
    },
    [zoom, panOffset],
  )

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#fefefe"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoom, zoom)

    drawEnhancedGrid(ctx)

    elements.forEach((element) => {
      drawElement(ctx, element, element.id === selectedElementId)
    })

    if (selectedTool === "pencil" && currentPath.length > 1) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)

      for (let i = 1; i < currentPath.length - 2; i++) {
        const xc = (currentPath[i].x + currentPath[i + 1].x) / 2
        const yc = (currentPath[i].y + currentPath[i + 1].y) / 2
        ctx.quadraticCurveTo(currentPath[i].x, currentPath[i].y, xc, yc)
      }

      if (currentPath.length > 2) {
        ctx.quadraticCurveTo(
          currentPath[currentPath.length - 2].x,
          currentPath[currentPath.length - 2].y,
          currentPath[currentPath.length - 1].x,
          currentPath[currentPath.length - 1].y,
        )
      }

      ctx.stroke()
    }

    if (selectedTool === "eraser" && isErasing) {
      const { x, y } = getCanvasCoordinates(lastPanPoint.x, lastPanPoint.y)
      ctx.strokeStyle = "#ff4444"
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, 2 * Math.PI)
      ctx.stroke()
    }

    ctx.restore()

    cursors.forEach((cursor) => {
      const screenX = cursor.x * zoom + panOffset.x
      const screenY = cursor.y * zoom + panOffset.y

      ctx.save()
      ctx.fillStyle = cursor.color
      ctx.beginPath()
      ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif"
      ctx.fillStyle = "white"
      ctx.fillRect(screenX + 10, screenY - 20, ctx.measureText(cursor.userName).width + 8, 16)
      ctx.fillStyle = cursor.color
      ctx.fillText(cursor.userName, screenX + 14, screenY - 8)
      ctx.restore()
    })
  }, [
    elements,
    zoom,
    panOffset,
    selectedElementId,
    selectedTool,
    currentPath,
    strokeColor,
    strokeWidth,
    cursors,
    isErasing,
    lastPanPoint,
    getCanvasCoordinates,
  ])

  const drawEnhancedGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20
    const viewportWidth = ctx.canvas.width / zoom
    const viewportHeight = ctx.canvas.height / zoom
    const offsetX = -panOffset.x / zoom
    const offsetY = -panOffset.y / zoom

    const gridPadding = Math.max(viewportWidth, viewportHeight) * 2
    const startX = offsetX - gridPadding
    const endX = offsetX + viewportWidth + gridPadding
    const startY = offsetY - gridPadding
    const endY = offsetY + viewportHeight + gridPadding

    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
    ctx.lineWidth = 1 / zoom
    ctx.beginPath()

    const firstVerticalLine = Math.floor(startX / gridSize) * gridSize
    for (let x = firstVerticalLine; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }

    const firstHorizontalLine = Math.floor(startY / gridSize) * gridSize
    for (let y = firstHorizontalLine; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }

    ctx.stroke()

    const majorGridSize = gridSize * 5
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 1 / zoom
    ctx.beginPath()

    const firstMajorVertical = Math.floor(startX / majorGridSize) * majorGridSize
    for (let x = firstMajorVertical; x <= endX; x += majorGridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }

    const firstMajorHorizontal = Math.floor(startY / majorGridSize) * majorGridSize
    for (let y = firstMajorHorizontal; y <= endY; y += majorGridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }

    ctx.stroke()
  }

  const eraseAtPoint = useCallback(
    (x: number, y: number) => {
      const elementsToDelete = elements.filter((element) => isPointInElement({ x, y }, element))

      elementsToDelete.forEach((element) => {
        deleteElement(element.id)
        if (socket && roomId) {
          const message: WebSocketMessage = {
            type: "drawing_delete",
            roomId,
            elementId: element.id,
          }
          socket.send(JSON.stringify(message))
        }
      })
    },
    [elements, deleteElement, socket, roomId],
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pendingImagePosition) return

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const elementId = Date.now().toString()
          const maxWidth = 300
          const maxHeight = 300

          let { width, height } = img
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          const newElement = {
            id: elementId,
            type: "image" as const,
            x: pendingImagePosition.x,
            y: pendingImagePosition.y,
            width,
            height,
            imageData: event.target?.result as string,
            strokeColor,
            strokeWidth,
            fillColor: "transparent",
            strokeStyle,
          }

          addElement(newElement)
          broadcastElement(newElement)
          setPendingImagePosition(null)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }

    e.target.value = ""
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)

    if (selectedTool === "image") {
      setPendingImagePosition({ x, y })
      fileInputRef.current?.click()
      return
    }

    if (selectedTool === "text") {
      if (isEditingText) {
        finishTextEditing()
      }

      const elementId = Date.now().toString()

      const newElement = {
        id: elementId,
        type: "text" as const,
        x,
        y,
        width: 200,
        height: 40,
        text: "",
        strokeColor,
        strokeWidth,
        fillColor: "transparent",
        strokeStyle,
        imageData: undefined,
      }
      addElement(newElement)
      broadcastElement(newElement)

      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const screenX = Math.max(20, Math.min(window.innerWidth - 320, x * zoom + panOffset.x + rect.left))
        const screenY = Math.max(20, Math.min(window.innerHeight - 120, y * zoom + panOffset.y + rect.top))

        setTextEditPosition({ x: screenX, y: screenY })
        setTextEditValue("")
        setTextEditElementId(elementId)
        setIsEditingText(true)

        requestAnimationFrame(() => {
          if (textInputRef.current) {
            textInputRef.current.focus()
            textInputRef.current.select()
          }
        })
      }
      return
    }

    if (isEditingText && textInputRef.current) {
      finishTextEditing()
      return
    }

    if (selectedTool === "hand") {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (selectedTool === "select") {
      const clickedElement = elements.find((element) => isPointInElement({ x, y }, element))

      if (clickedElement) {
        if (clickedElement.type === "text") {
          const now = Date.now()
          const lastClick = (clickedElement as any).lastClickTime || 0
          if (now - lastClick < 300) {
            startTextEditing(clickedElement, x, y)
            return
          } else {
            ;(clickedElement as any).lastClickTime = now
          }
        }

        setSelectedElementId(clickedElement.id)
        setIsDragging(true)
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y,
        })
      } else {
        setSelectedElementId(null)
      }
      return
    }

    if (selectedTool === "eraser") {
      setIsErasing(true)
      eraseAtPoint(x, y)
      return
    }

    setIsDrawing(true)
    const elementId = Date.now().toString()

    if (selectedTool === "pencil") {
      const newPath = [{ x, y }]
      setCurrentPath(newPath)
      const newElement = {
        id: elementId,
        type: "pencil" as const,
        x,
        y,
        points: newPath,
        strokeColor,
        strokeWidth,
        fillColor,
        strokeStyle,
      }
      addElement(newElement)
      broadcastElement(newElement)
    } else if (["rectangle", "diamond", "circle", "arrow", "line"].includes(selectedTool)) {
      const newElement = {
        id: elementId,
        type: selectedTool as any,
        x,
        y,
        width: 0,
        height: 0,
        strokeColor,
        strokeWidth,
        fillColor,
        strokeStyle,
        imageData: undefined,
      }
      addElement(newElement)
      broadcastElement(newElement)
    }
  }

  const startTextEditing = (element: any = null, x: number, y: number, newElementId?: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = Math.max(50, Math.min(window.innerWidth - 250, x * zoom + panOffset.x + rect.left))
    const screenY = Math.max(50, Math.min(window.innerHeight - 100, y * zoom + panOffset.y + rect.top))

    setTextEditPosition({ x: screenX, y: screenY })
    setTextEditValue(element?.text || "")
    setTextEditElementId(element?.id || newElementId || null)
    setIsEditingText(true)

    if (!element && newElementId) {
      const newElement = {
        id: newElementId,
        type: "text" as const,
        x,
        y,
        width: 250,
        height: 60,
        text: "",
        strokeColor,
        strokeWidth,
        fillColor: "transparent",
        strokeStyle,
        imageData: undefined,
      }
      addElement(newElement)
      broadcastElement(newElement)
    }

    requestAnimationFrame(() => {
      if (textInputRef.current) {
        textInputRef.current.focus()
        textInputRef.current.select()
      }
    })
  }

  const finishTextEditing = () => {
    if (textEditElementId && textEditValue.trim()) {
      const updatedElement = elements.find((el) => el.id === textEditElementId)
      if (updatedElement) {
        const fontSize = Math.max(16, strokeWidth * 8)
        const lines = textEditValue.trim().split("\n")
        const maxLineLength = Math.max(...lines.map((line) => line.length), 1)
        const estimatedWidth = Math.max(100, maxLineLength * fontSize * 0.6)
        const estimatedHeight = Math.max(30, lines.length * fontSize * 1.2)

        const newElement = {
          ...updatedElement,
          text: textEditValue.trim(),
          width: estimatedWidth,
          height: estimatedHeight,
        }
        updateElement(textEditElementId, {
          text: textEditValue.trim(),
          width: estimatedWidth,
          height: estimatedHeight,
        })
        broadcastElement(newElement)
      }
    } else if (textEditElementId && !textEditValue.trim()) {
      deleteElement(textEditElementId)
    }

    setIsEditingText(false)
    setTextEditElementId(null)
    setTextEditValue("")
  }

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextEditValue(e.target.value)

    if (textEditElementId) {
      const fontSize = Math.max(16, strokeWidth * 8)
      const lines = e.target.value.split("\n")
      const maxLineLength = Math.max(...lines.map((line) => line.length), 1)
      const estimatedWidth = Math.max(100, maxLineLength * fontSize * 0.6)
      const estimatedHeight = Math.max(30, lines.length * fontSize * 1.2)

      updateElement(textEditElementId, {
        text: e.target.value,
        width: estimatedWidth,
        height: estimatedHeight,
      })
    }
  }

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      finishTextEditing()
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      finishTextEditing()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)

    broadcastCursor(x, y)

    const container = containerRef.current
    if (container) {
      container.style.cursor = getCursorStyle()
    }

    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      })
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (isErasing) {
      eraseAtPoint(x, y)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (isDragging && selectedElementId) {
      const element = elements.find((el) => el.id === selectedElementId)
      if (element) {
        const newX = x - dragOffset.x
        const newY = y - dragOffset.y
        const updatedElement = { ...element, x: newX, y: newY }
        updateElement(selectedElementId, { x: newX, y: newY })
        broadcastElement(updatedElement)
      }
      return
    }

    if (!isDrawing) return

    const currentElement = elements[elements.length - 1]

    if (selectedTool === "pencil" && currentElement?.type === "pencil") {
      const newPath = [...currentPath, { x, y }]
      setCurrentPath(newPath)
      const updatedElement = { ...currentElement, points: newPath }
      updateElement(currentElement.id, {
        points: newPath,
      })
      broadcastElement(updatedElement)
    } else if (["rectangle", "diamond", "circle", "arrow", "line"].includes(selectedTool)) {
      const updatedElement = {
        ...currentElement,
        width: x - currentElement.x,
        height: y - currentElement.y,
      }
      updateElement(currentElement.id, {
        width: x - currentElement.x,
        height: y - currentElement.y,
      })
      broadcastElement(updatedElement)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setIsPanning(false)
    setIsDragging(false)
    setIsErasing(false)
    setCurrentPath([])

    const container = containerRef.current
    if (container) {
      container.style.cursor = getCursorStyle()
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta))

      const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
      const newPanOffset = {
        x: panOffset.x - x * (newZoom - zoom),
        y: panOffset.y - y * (newZoom - zoom),
      }

      setZoom(newZoom)
      setPanOffset(newPanOffset)
    } else {
      setPanOffset({
        x: panOffset.x - e.deltaX,
        y: panOffset.y - e.deltaY,
      })
    }

    const container = containerRef.current
    if (container) {
      container.style.cursor = getCursorStyle()
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditingText) return

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          deleteElement(selectedElementId)
          setSelectedElementId(null)
          if (socket && roomId) {
            const message: WebSocketMessage = {
              type: "drawing_delete",
              roomId,
              elementId: selectedElementId,
            }
            socket.send(JSON.stringify(message))
          }
        }
      } else if (e.key === "Escape") {
        setSelectedElementId(null)
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault()
          // TODO: Implement undo
        } else if (e.key === "y") {
          e.preventDefault()
          // TODO: Implement redo
        }
      }
    },
    [selectedElementId, deleteElement, setSelectedElementId, socket, roomId, isEditingText],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redraw()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [redraw])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getCursorStyle = useCallback(() => {
    switch (selectedTool) {
      case "hand":
        return isPanning ? "grabbing" : "grab"
      case "select":
        return isDragging ? "grabbing" : "default"
      case "pencil":
        return "crosshair"
      case "eraser":
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.5l9.6-9.6c1-1 2.5-1 3.5 0l5.2 5.2c1 1 1 2.5 0 3.5L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>\') 12 12, crosshair'
      case "text":
        return "text"
      default:
        return "crosshair"
    }
  }, [selectedTool, isPanning, isDragging])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.style.cursor = getCursorStyle()
    }
  }, [getCursorStyle, selectedTool, isPanning, isDragging])

  return (
    <div className="w-full h-screen bg-gray-50 relative">
      <Toolbar />
      <PropertiesPanel />
      <ZoomControls />
      <CollaborationPanel roomId={roomId} />

      <div
        ref={containerRef}
        className="canvas-container"
        style={{
          cursor: getCursorStyle(),
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onMouseEnter={() => {
          const container = containerRef.current
          if (container) {
            container.style.cursor = getCursorStyle()
          }
        }}
        onMouseLeave={() => {
          const container = containerRef.current
          if (container) {
            container.style.cursor = "default"
          }
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden-file-input"
      />

      {isEditingText && (
        <textarea
          ref={textInputRef}
          value={textEditValue}
          onChange={handleTextInputChange}
          onKeyDown={handleTextInputKeyDown}
          onBlur={finishTextEditing}
          className="text-input-overlay"
          style={{
            left: `${textEditPosition.x}px`,
            top: `${textEditPosition.y}px`,
            color: strokeColor,
            fontSize: `${Math.max(18, strokeWidth * 10)}px`,
            fontWeight: strokeWidth > 2 ? "bold" : "normal",
          }}
          placeholder="Type your text here..."
          autoFocus
          rows={3}
        />
      )}

      <div className="status-indicator fixed top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2 text-sm">
        <div className={`status-dot ${isConnected ? "connected" : "disconnected"}`} />
        <span className="text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
        {roomId && <span className="text-gray-400">Room: {roomId}</span>}
      </div>
    </div>
  )
}
