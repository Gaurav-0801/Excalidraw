"use client"

import { Suspense } from "react"
import { Whiteboard } from "../components/Whiteboard"

function WhiteboardWrapper() {
  return <Whiteboard />
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WhiteboardWrapper />
    </Suspense>
  )
}
