"use client"

import { Minus, Plus } from "lucide-react"
import { useWhiteboardStore } from "../store/whiteboardStore"

export function ZoomControls() {
  const { zoom, setZoom, setPanOffset } = useWhiteboardStore()

  const handleZoomIn = () => {
    setZoom(Math.min(5, zoom * 1.2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(0.1, zoom / 1.2))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <div className="zoom-controls">
      <button className="zoom-button" onClick={handleZoomOut}>
        <Minus size={16} />
      </button>

      <button className="px-2 text-sm font-medium hover:bg-gray-100 rounded" onClick={handleResetZoom}>
        {Math.round(zoom * 100)}%
      </button>

      <button className="zoom-button" onClick={handleZoomIn}>
        <Plus size={16} />
      </button>
    </div>
  )
}
