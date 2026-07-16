import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Memory } from '../types'
import { MemoryCard } from './MemoryCard'

export type RevealPhase = 'opening' | 'open' | 'closing'

type MemoryRevealProps = {
  memory: Memory | null
  phase: RevealPhase | null
  onCloseRequest: () => void
  onOpened: () => void
  onClosed: () => void
}

export function MemoryReveal({
  memory,
  phase,
  onCloseRequest,
  onOpened,
  onClosed,
}: MemoryRevealProps) {
  const [touchCloseReady, setTouchCloseReady] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const update = () => setIsCoarsePointer(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (phase !== 'open') {
      setTouchCloseReady(false)
      return
    }
    const timer = window.setTimeout(() => setTouchCloseReady(true), 700)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    const scrollable = phase === 'open' || phase === 'opening'
    document.documentElement.style.overflow = scrollable ? 'auto' : 'hidden'
    document.body.style.overflow = scrollable ? 'auto' : 'hidden'
    return () => {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
  }, [phase])

  const show = Boolean(memory && phase)

  return (
    <AnimatePresence>
      {show && memory && phase && (
        <motion.div
          key={memory.id}
          className="fixed inset-0 z-40 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-jar-bg/50" aria-hidden />

          <div
            role="presentation"
            className="relative z-10 flex min-h-full touch-manipulation items-center justify-center px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            onClick={() => {
              if (phase === 'open') onCloseRequest()
            }}
          >
            <motion.div
              className="relative will-change-transform"
              initial="folded"
              animate={
                phase === 'closing'
                  ? 'closing'
                  : phase === 'open'
                    ? 'open'
                    : 'opening'
              }
              variants={noteVariants}
              onAnimationComplete={(definition) => {
                // Ignore child variant completions — only the parent note variants.
                if (definition === 'opening') onOpened()
                if (definition === 'closing') onClosed()
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (isCoarsePointer && touchCloseReady && phase === 'open') {
                  onCloseRequest()
                }
              }}
            >
              {/* Folded silhouette — opacity only (no competing scaleX) */}
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                variants={foldedFlapVariants}
                aria-hidden
              >
                <FoldedNoteVisual />
              </motion.div>

              <motion.div variants={cardVariants} className="relative">
                <MemoryCard
                  memory={memory}
                  contentVisible={phase === 'open' || phase === 'opening'}
                />
              </motion.div>

              {isCoarsePointer && phase === 'open' && (
                <motion.button
                  type="button"
                  aria-label="Close memory"
                  className="absolute -top-3 right-2 flex h-11 w-11 items-center justify-center text-[#8a7a68]/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: touchCloseReady ? 0.65 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    onCloseRequest()
                  }}
                >
                  <span className="font-message text-2xl leading-none">×</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Single spring path — no mid-keyframe overshoot, no second tween when
 * landing on `open` (duration 0), which was the main source of jitter.
 */
const noteVariants = {
  folded: {
    y: 130,
    scale: 0.42,
    rotate: -8,
    opacity: 0,
  },
  opening: {
    y: 0,
    scale: 1,
    rotate: -1.5,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 20,
      mass: 0.9,
      opacity: { type: 'tween' as const, duration: 0.22, ease: 'easeOut' as const },
    },
  },
  open: {
    y: 0,
    scale: 1,
    rotate: -1.5,
    opacity: 1,
    transition: { duration: 0 },
  },
  closing: {
    y: 150,
    scale: 0.38,
    rotate: 8,
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 130,
      damping: 22,
      mass: 0.85,
      opacity: {
        type: 'tween' as const,
        duration: 0.28,
        delay: 0.12,
        ease: 'easeIn' as const,
      },
    },
  },
}

const foldedFlapVariants = {
  folded: { opacity: 1 },
  opening: {
    opacity: 0,
    transition: { duration: 0.28, delay: 0.18, ease: 'easeOut' as const },
  },
  open: { opacity: 0, transition: { duration: 0 } },
  closing: {
    opacity: 1,
    transition: { duration: 0.22, delay: 0.05, ease: 'easeIn' as const },
  },
}

const cardVariants = {
  folded: { opacity: 0 },
  opening: {
    opacity: 1,
    transition: { duration: 0.35, delay: 0.2, ease: 'easeOut' as const },
  },
  open: { opacity: 1, transition: { duration: 0 } },
  closing: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

function FoldedNoteVisual() {
  return (
    <div
      className="relative h-16 w-24"
      style={{
        background: 'linear-gradient(145deg, #f7f1e6, #e8dcc8)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
      }}
    >
      <div
        className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(140,120,90,0.55), transparent)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.06), transparent 40%, transparent 60%, rgba(0,0,0,0.05))',
        }}
      />
    </div>
  )
}
