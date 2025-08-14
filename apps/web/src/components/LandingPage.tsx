"use client"

import Link from "next/link"
import { ArrowRight, Palette, Users, Zap, Github, Star } from "lucide-react"
import { ExcalidrawLogo } from "./ExcalidrawLogo"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <ExcalidrawLogo />
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={20} />
                <Star size={16} />
                <span className="text-sm font-medium">105.3k</span>
              </a>
              <Link href="/signin" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium button-hover"
              >
                Free whiteboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="auth-gradient py-20 relative overflow-hidden">
          <div className="floating-shapes"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Step up your <span className="text-primary">Excalidraw</span> game
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Save your drawings to the cloud. Collaborate seamlessly. Unlock additional features.
            </p>
            <p className="text-lg text-muted-foreground mb-12">Support open-source development.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg button-hover inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/signin"
                className="bg-white text-foreground px-8 py-4 rounded-xl font-semibold text-lg border border-border button-hover"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Infinite canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Hand-drawn feel</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why choose our platform?</h2>
              <p className="text-xl text-muted-foreground">Everything you need for collaborative whiteboarding</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Powerful Drawing Tools</h3>
                <p className="text-muted-foreground">
                  Complete set of drawing tools including shapes, arrows, text, and freehand drawing with perfect
                  precision and a hand-drawn aesthetic.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Work together in real-time with your team. See cursors, changes, and chat with collaborators
                  instantly. Perfect for remote teams.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Optimized for performance with infinite canvas, smooth zooming, responsive interactions, and minimal
                  latency.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using our collaborative whiteboard to bring their ideas to life.
            </p>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg button-hover inline-flex items-center"
            >
              Start Drawing Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ExcalidrawLogo className="mb-4 md:mb-0" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <a href="https://github.com" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Github size={16} />
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>Built with ❤️ for the creative community. Open source and free forever.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
