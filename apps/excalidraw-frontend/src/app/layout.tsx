import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "../components/ErrorBoundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Excalidraw Clone - Collaborative Whiteboard",
  description: "A powerful collaborative whiteboard application with real-time drawing and chat features",
  keywords: ["whiteboard", "collaboration", "drawing", "real-time", "excalidraw"],
  authors: [{ name: "Excalidraw Clone Team" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
