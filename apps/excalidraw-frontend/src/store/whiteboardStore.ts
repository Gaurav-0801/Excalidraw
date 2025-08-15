import { create } from "zustand"

export type Tool =
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

export interface Point {
  x: number
  y: number
}

export interface Element {
  id: string
  type: Tool
  x: number
  y: number
  width?: number
  height?: number
  points?: Point[]
  strokeColor: string
  strokeWidth: number
  fillColor: string
  strokeStyle?: "solid" | "dashed" | "dotted"
  text?: string
  imageData?: string // Added imageData property
  userId?: string // Added for collaboration
  timestamp?: number // Added for collaboration
}

interface WhiteboardState {
  elements: Element[]
  selectedTool: Tool
  strokeColor: string
  strokeWidth: number
  fillColor: string
  strokeStyle: "solid" | "dashed" | "dotted"
  zoom: number
  panOffset: Point
  selectedElementId: string | null

  // Actions
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  setElements: (elements: Element[]) => void
  setSelectedTool: (tool: Tool) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFillColor: (color: string) => void
  setStrokeStyle: (style: "solid" | "dashed" | "dotted") => void
  setZoom: (zoom: number) => void
  setPanOffset: (offset: Point) => void
  setSelectedElementId: (id: string | null) => void
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  elements: [],
  selectedTool: "select",
  strokeColor: "#000000",
  strokeWidth: 2,
  fillColor: "transparent",
  strokeStyle: "solid",
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  selectedElementId: null,

  addElement: (element) => {
    const existingIndex = get().elements.findIndex((el) => el.id === element.id)
    if (existingIndex >= 0) {
      // Update existing element
      set((state) => ({
        elements: state.elements.map((el, index) => (index === existingIndex ? element : el)),
      }))
    } else {
      // Add new element
      set((state) => ({ elements: [...state.elements, element] }))
    }
  },

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    })),

  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),

  setElements: (elements) => set({ elements }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeStyle: (style) => set({ strokeStyle: style }),
  setZoom: (zoom) => set({ zoom }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
}))
