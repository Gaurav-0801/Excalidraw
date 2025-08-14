"use client"

import { useWhiteboardStore } from "../store/whiteboardStore"
import { Trash2, Copy } from "lucide-react"

const colors = [
  "#000000",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#7048e8",
  "#495057",
  "#fa5252",
  "#51cf66",
  "#339af0",
  "#ff922b",
  "#9775fa",
  "#868e96",
  "#ff6b6b",
  "#69db7c",
  "#74c0fc",
  "#ffd43b",
  "#da77f2",
]

const strokeWidths = [1, 2, 4, 8, 12]

const strokeStyles = [
  { id: "solid", label: "Solid", pattern: [] },
  { id: "dashed", label: "Dashed", pattern: [8, 4] },
  { id: "dotted", label: "Dotted", pattern: [2, 4] },
]

const sloppinessLevels = [
  { id: 0, label: "Precise" },
  { id: 1, label: "Sketchy" },
  { id: 2, label: "Very Sketchy" },
]

export function PropertiesPanel() {
  const {
    strokeColor,
    strokeWidth,
    fillColor,
    strokeStyle,
    selectedElementId,
    elements,
    setStrokeColor,
    setStrokeWidth,
    setFillColor,
    setStrokeStyle,
    deleteElement,
    setSelectedElementId,
  } = useWhiteboardStore()

  const selectedElement = elements.find((el) => el.id === selectedElementId)

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId)
      setSelectedElementId(null)
    }
  }

  const handleDuplicateSelected = () => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: Date.now().toString(),
        x: selectedElement.x + 20,
        y: selectedElement.y + 20,
      }
      // This would need to be implemented in the store
      console.log("Duplicate element:", newElement)
    }
  }

  return (
    <div className="properties-panel">
      {selectedElement && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium mb-3 text-blue-900">Selected Element</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDuplicateSelected}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
              title="Duplicate"
            >
              <Copy size={12} />
              Copy
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Stroke</h3>
        <div className="color-palette">
          {colors.map((color) => (
            <button
              key={color}
              className={`color-button ${strokeColor === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Background</h3>
        <div className="color-palette">
          <button
            className={`color-button ${fillColor === "transparent" ? "active" : ""}`}
            style={{
              background:
                "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            }}
            onClick={() => setFillColor("transparent")}
            title="Transparent"
          />
          {colors.map((color) => (
            <button
              key={color}
              className={`color-button ${fillColor === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setFillColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Stroke width</h3>
        <div className="flex gap-1">
          {strokeWidths.map((width) => (
            <button
              key={width}
              className={`flex-1 h-10 border rounded flex items-center justify-center ${strokeWidth === width ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"} transition-colors`}
              onClick={() => setStrokeWidth(width)}
              title={`${width}px`}
            >
              <div
                className="bg-black rounded-full"
                style={{
                  width: `${Math.min(width * 2, 16)}px`,
                  height: `${Math.min(width * 2, 16)}px`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Stroke style</h3>
        <div className="space-y-1">
          {strokeStyles.map((style) => (
            <button
              key={style.id}
              className={`w-full h-8 border rounded flex items-center justify-center ${strokeStyle === style.id ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"} transition-colors`}
              onClick={() => setStrokeStyle(style.id as any)}
              title={style.label}
            >
              <div
                className="w-16 h-0.5 bg-black"
                style={{
                  backgroundImage:
                    style.pattern.length > 0
                      ? `repeating-linear-gradient(to right, black 0, black ${style.pattern[0]}px, transparent ${style.pattern[0]}px, transparent ${style.pattern[0] + style.pattern[1]}px)`
                      : undefined,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Sloppiness</h3>
        <div className="space-y-1">
          {sloppinessLevels.map((level) => (
            <button
              key={level.id}
              className="w-full h-8 border rounded flex items-center justify-center border-gray-300 hover:border-gray-400 transition-colors text-xs"
              title={level.label}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Opacity</h3>
        <input
          type="range"
          min="10"
          max="100"
          defaultValue="100"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          title="Opacity"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Layers</h3>
        <div className="flex gap-1">
          <button
            className="flex-1 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors text-xs"
            title="Send to back"
          >
            ↓
          </button>
          <button
            className="flex-1 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors text-xs"
            title="Send backward"
          >
            ↓
          </button>
          <button
            className="flex-1 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors text-xs"
            title="Bring forward"
          >
            ↑
          </button>
          <button
            className="flex-1 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors text-xs"
            title="Bring to front"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
