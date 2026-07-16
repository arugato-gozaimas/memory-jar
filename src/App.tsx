import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { HeartCursor } from './components/HeartCursor'
import { JarScene } from './components/JarScene'
import {
  MemoryReveal,
  type RevealPhase,
} from './components/MemoryReveal'
import { useMemories } from './hooks/useMemories'
import { shuffleMemories } from './lib/shuffle'
import type { Memory } from './types'

function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-xs px-6 text-center font-message text-sm italic leading-relaxed text-stone-400/80">
      {children}
    </p>
  )
}

function App() {
  const { memories, isLoading, error } = useMemories()
  const ready = !isLoading && !error && memories.length > 0

  /** Shuffled once per load / restart — never persisted. */
  const [deck, setDeck] = useState<Memory[]>([])
  /** Next index to draw; memories at [0, nextIndex) have been shown. */
  const [nextIndex, setNextIndex] = useState(0)
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null)
  const [phase, setPhase] = useState<RevealPhase | null>(null)

  // Shuffle the full deck once memories finish loading.
  useEffect(() => {
    if (isLoading || error || memories.length === 0) return
    setDeck(shuffleMemories(memories))
    setNextIndex(0)
    setActiveMemory(null)
    setPhase(null)
  }, [isLoading, error, memories])

  const jarBusy = phase === 'opening' || phase === 'open' || phase === 'closing'
  const exhausted =
    ready && deck.length > 0 && nextIndex >= deck.length && !jarBusy
  const jarInteractive = ready && !jarBusy

  const refillJar = useCallback(() => {
    setDeck(shuffleMemories(memories))
    setNextIndex(0)
  }, [memories])

  const handleJarClick = useCallback(() => {
    if (!jarInteractive) return

    if (exhausted) {
      refillJar()
      return
    }

    const next = deck[nextIndex]
    if (!next) return

    setNextIndex((index) => index + 1)
    setActiveMemory(next)
    setPhase('opening')
  }, [jarInteractive, exhausted, refillJar, deck, nextIndex])

  const handleCloseRequest = useCallback(() => {
    if (phase !== 'open') return
    setPhase('closing')
  }, [phase])

  const handleOpened = useCallback(() => {
    setPhase('open')
  }, [])

  const handleClosed = useCallback(() => {
    setActiveMemory(null)
    setPhase(null)
  }, [])

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-jar-bg px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <HeartCursor />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[min(55vw,360px)] w-[min(55vw,360px)] translate-y-8 rounded-full bg-jar-glow/[0.07] blur-3xl" />
      </div>

      <div className="relative z-10 flex h-[100dvh] w-full max-w-lg flex-col items-center justify-center overflow-hidden px-2 sm:px-4">
        <JarScene
          interactive={jarInteractive}
          empty={exhausted}
          showHint={!exhausted && jarInteractive && !activeMemory}
          onJarClick={jarInteractive ? handleJarClick : undefined}
        />

        {exhausted && (
          <p className="mt-1 max-w-[18rem] text-center font-message text-[0.875rem] leading-relaxed text-stone-400/85">
            You&apos;ve opened every memory. ❤️
          </p>
        )}

        {isLoading && (
          <div className="mt-2">
            <StatusMessage>Gathering memories…</StatusMessage>
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-2">
            <StatusMessage>{error}</StatusMessage>
          </div>
        )}
      </div>

      <MemoryReveal
        memory={activeMemory}
        phase={phase}
        onCloseRequest={handleCloseRequest}
        onOpened={handleOpened}
        onClosed={handleClosed}
      />
    </main>
  )
}

export default App
