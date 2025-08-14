"use client"

import React from "react"

import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  ImageIcon,
  Eraser,
  Zap,
  Share,
  BookOpen,
  Download,
  Upload,
  Undo,
  Redo,
} from "lucide-react"
import { useWhiteboardStore } from "../store/whiteboardStore"

const tools = [
  { id: "select", icon: MousePointer2, label: "Select (V)", shortcut: "V" },
  { id: "hand", icon: Hand, label: "Hand (H)", shortcut: "H" },
  { id: "rectangle", icon: Square, label: "Rectangle (R)", shortcut: "R" },
  { id: "diamond", icon: Diamond, label: "Diamond (D)", shortcut: "D" },
  { id: "circle", icon: Circle, label: "Circle (O)", shortcut: "O" },
  { id: "arrow", icon: ArrowRight, label: "Arrow (A)", shortcut: "A" },
  { id: "line", icon: Minus, label: "Line (L)", shortcut: "L" },
  { id: "pencil", icon: Pencil, label: "Draw (P)", shortcut: "P" },
  { id: "text", icon: Type, label: "Text (T)", shortcut: "T" },
  { id: "image", icon: ImageIcon, label: "Image (I)", shortcut: "I" },
  { id: "eraser", icon: Eraser, label: "Eraser (E)", shortcut: "E" },
  { id: "laser", icon: Zap, label: "Laser Pointer", shortcut: "" },
]

export function Toolbar() {
  const { selectedTool, setSelectedTool, elements } = useWhiteboardStore()

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return // Don't trigger shortcuts when typing
    }

    const keyMap: Record<string, string> = {
      v: "select",
      h: "hand",
      r: "rectangle",
      d: "diamond",
      o: "circle",
      a: "arrow",
      l: "line",
      p: "pencil",
      t: "text",
      i: "image",
      e: "eraser",
    }

    const tool = keyMap[e.key.toLowerCase()]
    if (tool) {
      setSelectedTool(tool as any)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(elements, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `excalidraw-${Date.now()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            // This would need to be implemented in the store
            console.log("Import data:", data)
          } catch (error) {
            alert("Invalid file format")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: "Excalidraw Clone - Collaborative Whiteboard",
        text: "Join me on this collaborative whiteboard!",
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Room URL copied to clipboard!")
      })
    }
  }

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="toolbar">
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              className={`toolbar-button group relative ${selectedTool === tool.id ? "active" : ""}`}
              onClick={() => setSelectedTool(tool.id as any)}
              title={tool.label}
            >
              <Icon size={18} />
              {tool.shortcut && (
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {tool.shortcut}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="w-px h-8 bg-gray-300 mx-2" />

      <div className="flex items-center gap-1">
        <button className="toolbar-button" title="Undo (Ctrl+Z)" disabled>
          <Undo size={18} />
        </button>

        <button className="toolbar-button" title="Redo (Ctrl+Y)" disabled>
          <Redo size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-300 mx-2" />

      <div className="flex items-center gap-1">
        <button className="toolbar-button" title="Export Drawing" onClick={handleExport}>
          <Download size={18} />
        </button>

        <button className="toolbar-button" title="Import Drawing" onClick={handleImport}>
          <Upload size={18} />
        </button>

        <button className="toolbar-button" title="Share Room" onClick={handleShare}>
          <Share size={18} />
        </button>

        <button className="toolbar-button" title="Library (Coming Soon)" disabled>
          <BookOpen size={18} />
        </button>
      </div>
    </div>
  )
}
