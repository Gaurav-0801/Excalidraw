import type { Element, Point } from "../store/whiteboardStore"
import { getStroke } from "perfect-freehand"

export function drawElement(ctx: CanvasRenderingContext2D, element: Element, isSelected = false) {
  ctx.save()

  // Set stroke properties
  ctx.strokeStyle = element.strokeColor
  ctx.lineWidth = element.strokeWidth
  ctx.fillStyle = element.fillColor === "transparent" ? "transparent" : element.fillColor

  // Set line dash pattern
  if (element.strokeStyle === "dashed") {
    ctx.setLineDash([8, 4])
  } else if (element.strokeStyle === "dotted") {
    ctx.setLineDash([2, 4])
  } else {
    ctx.setLineDash([])
  }

  // Set line cap and join for better appearance
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  switch (element.type) {
    case "rectangle":
      drawRectangle(ctx, element)
      break
    case "diamond":
      drawDiamond(ctx, element)
      break
    case "circle":
      drawCircle(ctx, element)
      break
    case "arrow":
      drawArrow(ctx, element)
      break
    case "line":
      drawLine(ctx, element)
      break
    case "pencil":
      drawPencil(ctx, element)
      break
    case "text":
      drawText(ctx, element)
      break
    default:
      break
  }

  // Draw selection outline
  if (isSelected) {
    const bounds = getElementBounds(element)
    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 2 / ctx.getTransform().a // Adjust for zoom
    ctx.setLineDash([8, 4])
    ctx.strokeRect(bounds.x - 8, bounds.y - 8, bounds.width + 16, bounds.height + 16)

    // Draw selection handles
    const handleSize = 8 / ctx.getTransform().a
    const handles = [
      { x: bounds.x - handleSize / 2, y: bounds.y - handleSize / 2 },
      { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y - handleSize / 2 },
      { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2 },
      { x: bounds.x - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2 },
    ]

    ctx.fillStyle = "#6366f1"
    ctx.setLineDash([])
    handles.forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })
  }

  ctx.restore()
}

function drawRectangle(ctx: CanvasRenderingContext2D, element: Element) {
  const { x, y, width = 0, height = 0, fillColor } = element

  ctx.beginPath()
  ctx.rect(x, y, width, height)

  if (fillColor !== "transparent") {
    ctx.fill()
  }
  ctx.stroke()
}

function drawDiamond(ctx: CanvasRenderingContext2D, element: Element) {
  const { x, y, width = 0, height = 0, fillColor } = element
  const centerX = x + width / 2
  const centerY = y + height / 2

  ctx.beginPath()
  ctx.moveTo(centerX, y)
  ctx.lineTo(x + width, centerY)
  ctx.lineTo(centerX, y + height)
  ctx.lineTo(x, centerY)
  ctx.closePath()

  if (fillColor !== "transparent") {
    ctx.fill()
  }
  ctx.stroke()
}

function drawCircle(ctx: CanvasRenderingContext2D, element: Element) {
  const { x, y, width = 0, height = 0, fillColor } = element
  const centerX = x + width / 2
  const centerY = y + height / 2
  const radiusX = Math.abs(width) / 2
  const radiusY = Math.abs(height) / 2

  ctx.beginPath()
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)

  if (fillColor !== "transparent") {
    ctx.fill()
  }
  ctx.stroke()
}

function drawArrow(ctx: CanvasRenderingContext2D, element: Element) {
  const { x, y, width = 0, height = 0 } = element
  const endX = x + width
  const endY = y + height

  // Draw line
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Draw arrowhead
  const angle = Math.atan2(height, width)
  const arrowLength = Math.min(20, Math.sqrt(width * width + height * height) / 3)
  const arrowAngle = Math.PI / 6

  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(endX - arrowLength * Math.cos(angle - arrowAngle), endY - arrowLength * Math.sin(angle - arrowAngle))
  ctx.moveTo(endX, endY)
  ctx.lineTo(endX - arrowLength * Math.cos(angle + arrowAngle), endY - arrowLength * Math.sin(angle + arrowAngle))
  ctx.stroke()
}

function drawLine(ctx: CanvasRenderingContext2D, element: Element) {
  const { x, y, width = 0, height = 0 } = element

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y + height)
  ctx.stroke()
}

function drawPencil(ctx: CanvasRenderingContext2D, element: Element) {
  if (!element.points || element.points.length < 2) return

  // Use perfect-freehand for smooth pencil strokes
  const stroke = getStroke(
    element.points.map((p) => [p.x, p.y, 0.5]), // Add pressure value
    {
      size: element.strokeWidth * 2,
      thinning: 0.6,
      smoothing: 0.8,
      streamline: 0.8,
      easing: (t) => t,
      start: {
        taper: 0,
        cap: true,
      },
      end: {
        taper: 0,
        cap: true,
      },
    },
  )

  if (stroke.length === 0) return

  ctx.fillStyle = element.strokeColor
  ctx.beginPath()

  if (stroke.length === 1) {
    // Single point - draw a circle
    const [x, y] = stroke[0]
    ctx.arc(x, y, element.strokeWidth / 2, 0, 2 * Math.PI)
  } else {
    // Multiple points - draw the stroke path
    ctx.moveTo(stroke[0][0], stroke[0][1])

    for (let i = 1; i < stroke.length; i++) {
      const [x, y] = stroke[i]
      ctx.lineTo(x, y)
    }

    ctx.closePath()
  }

  ctx.fill()
}

function drawText(ctx: CanvasRenderingContext2D, element: Element) {
  if (!element.text) return

  const { x, y, strokeColor, strokeWidth } = element
  const fontSize = Math.max(12, strokeWidth * 8)

  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = strokeColor
  ctx.textBaseline = "top"

  // Handle multi-line text
  const lines = element.text.split("\n")
  const lineHeight = fontSize * 1.2

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight)
  })
}

export function isPointInElement(point: Point, element: Element): boolean {
  const bounds = getElementBounds(element)
  const tolerance = Math.max(5, element.strokeWidth)

  switch (element.type) {
    case "rectangle":
    case "diamond":
    case "text":
      return (
        point.x >= bounds.x - tolerance &&
        point.x <= bounds.x + bounds.width + tolerance &&
        point.y >= bounds.y - tolerance &&
        point.y <= bounds.y + bounds.height + tolerance
      )
    case "circle":
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y + bounds.height / 2
      const radiusX = bounds.width / 2 + tolerance
      const radiusY = bounds.height / 2 + tolerance
      const dx = (point.x - centerX) / radiusX
      const dy = (point.y - centerY) / radiusY
      return dx * dx + dy * dy <= 1
    case "line":
    case "arrow":
      return isPointNearLine(point, element, tolerance)
    case "pencil":
      if (!element.points) return false
      return element.points.some((p) => Math.sqrt((point.x - p.x) ** 2 + (point.y - p.y) ** 2) <= tolerance)
    default:
      return false
  }
}

function isPointNearLine(point: Point, element: Element, tolerance: number): boolean {
  const { x, y, width = 0, height = 0 } = element
  const x1 = x
  const y1 = y
  const x2 = x + width
  const y2 = y + height

  // Calculate distance from point to line segment
  const A = point.x - x1
  const B = point.y - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  if (lenSq === 0) return Math.sqrt(A * A + B * B) <= tolerance

  let param = dot / lenSq
  param = Math.max(0, Math.min(1, param))

  const xx = x1 + param * C
  const yy = y1 + param * D

  const dx = point.x - xx
  const dy = point.y - yy

  return Math.sqrt(dx * dx + dy * dy) <= tolerance
}

export function getElementBounds(element: Element): { x: number; y: number; width: number; height: number } {
  const { x, y, width = 0, height = 0, points, text, strokeWidth = 2 } = element

  if (element.type === "pencil" && points && points.length > 0) {
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const padding = strokeWidth

    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    }
  }

  if (element.type === "text" && text) {
    // Estimate text bounds
    const fontSize = Math.max(12, strokeWidth * 8)
    const lines = text.split("\n")
    const maxLineLength = Math.max(...lines.map((line) => line.length))
    const estimatedWidth = maxLineLength * fontSize * 0.6
    const estimatedHeight = lines.length * fontSize * 1.2

    return {
      x,
      y,
      width: estimatedWidth,
      height: estimatedHeight,
    }
  }

  return {
    x: Math.min(x, x + width),
    y: Math.min(y, y + height),
    width: Math.abs(width),
    height: Math.abs(height),
  }
}
