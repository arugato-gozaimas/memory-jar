import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import jarImage from '../assets/jar.png'

type JarSceneProps = {
  /** When false, jar is visible but not clickable (e.g. while memories load). */
  interactive?: boolean
  onJarClick?: () => void
  /** Show the subtle invitation beneath the jar. */
  showHint?: boolean
  /** All memories opened — hide the paper pile. */
  empty?: boolean
}

const ambientEase = [0.45, 0.05, 0.55, 0.95] as const

const CHITS = Array.from({ length: 48 }, (_, i) => {
  const row = Math.floor(i / 3)
  const col = i % 3
  const top = 2 + row * 5.2
  const left = 10 + col * 26 + ((row % 2) * 5 - 2)
  const yaws = [-48, -28, -12, 8, 22, 38, 52, -36, 14, -8, 44, -22]
  const widths = [44, 48, 42, 50, 46, 40]
  return {
    left: `${Math.max(6, Math.min(left, 50))}%`,
    top: `${Math.min(top, 86)}%`,
    yaw: yaws[i % yaws.length]! + (col - 1) * 6,
    w: `${widths[i % widths.length]!}%`,
    sy: 0.42 + (i % 4) * 0.025,
    delay: (i % 10) * 0.12,
    /** Only a subset drifts — keeps idle motion cheap on phones. */
    drifts: i % 4 === 0,
  }
})

const WALL_CHITS = [
  { left: '0%', top: '42%', yaw: -4, w: '30%', h: '52%', delay: 0.2, drifts: true },
  { left: '70%', top: '44%', yaw: 5, w: '30%', h: '50%', delay: 0.5, drifts: false },
  { left: '2%', top: '52%', yaw: -11, w: '32%', h: '46%', delay: 0.8, drifts: true },
  { left: '66%', top: '54%', yaw: 10, w: '32%', h: '44%', delay: 1.1, drifts: false },
  { left: '4%', top: '62%', yaw: 3, w: '28%', h: '38%', delay: 0.35, drifts: true },
  { left: '68%', top: '64%', yaw: -6, w: '28%', h: '36%', delay: 0.95, drifts: false },
  { left: '34%', top: '68%', yaw: -2, w: '32%', h: '32%', delay: 0.6, drifts: true },
  { left: '16%', top: '70%', yaw: 8, w: '28%', h: '30%', delay: 1.3, drifts: false },
  { left: '50%', top: '71%', yaw: -8, w: '28%', h: '28%', delay: 0.15, drifts: true },
] as const

export function JarScene({
  interactive = true,
  onJarClick,
  showHint = true,
  empty = false,
}: JarSceneProps) {
  const canClick = interactive && Boolean(onJarClick)
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setFinePointer(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotY = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 })
  const rotX = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 })

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Tilt only for mouse — touch drag shouldn't fight taps.
      if (!interactive || !finePointer) return
      const rect = event.currentTarget.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      rawX.set((px - 0.5) * 28)
      rawY.set((0.5 - py) * 12)
    },
    [interactive, finePointer, rawX, rawY],
  )

  const handlePointerLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onJarClick?.()
    }
  }

  const jarLabel = empty
    ? 'Start over — refill the memory jar'
    : 'Pull a memory from the jar'

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 sm:gap-4">
      <p className="max-w-[28rem] px-3 text-center font-message text-[0.95rem] font-medium leading-snug tracking-[0.02em] text-stone-400/80 sm:max-w-[34rem] sm:text-[1.05rem] sm:font-semibold">
        A jar full of{' '}
        <span className="italic text-stone-300/90">memories</span> to accompany
        on your next chapter — with love for{' '}
        <span className="italic text-stone-300/90">Anuja</span>
      </p>

      <motion.div
        role={canClick ? 'button' : undefined}
        tabIndex={canClick ? 0 : undefined}
        aria-label={canClick ? jarLabel : undefined}
        aria-disabled={!canClick}
        onClick={canClick ? onJarClick : undefined}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={
          canClick
            ? 'relative touch-manipulation outline-none focus-visible:ring-1 focus-visible:ring-jar-glow/30 focus-visible:ring-offset-4 focus-visible:ring-offset-jar-bg'
            : 'relative touch-manipulation'
        }
        style={
          finePointer
            ? {
                rotateX: rotX,
                rotateY: rotY,
                transformPerspective: 900,
                transformStyle: 'preserve-3d',
              }
            : undefined
        }
        whileHover={canClick && finePointer ? { scale: 1.02 } : undefined}
        whileTap={canClick ? { scale: 0.985 } : undefined}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="relative">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-[12%] -z-10 rounded-full bg-jar-glow/20 blur-3xl"
            animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.92, 1.04, 0.92] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: ambientEase }}
          />
          <JarVisual empty={empty} />
        </div>
      </motion.div>

      {showHint && interactive && !empty && (
        <p className="max-w-[16rem] px-2 text-center font-message text-[0.875rem] italic leading-relaxed text-stone-500/75 sm:text-[0.8125rem]">
          {finePointer
            ? 'Click the jar to pull out a memory.'
            : 'Tap the jar to pull out a memory.'}
        </p>
      )}
    </div>
  )
}

function JarVisual({ empty }: { empty: boolean }) {
  return (
    <div className="relative mx-auto aspect-square h-auto w-[min(86vw,72dvh,520px)] sm:w-[min(78vh,560px)]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[9%] left-1/2 h-[12%] w-[48%] -translate-x-1/2 rounded-[100%] bg-jar-glow/25 blur-2xl"
        animate={{ opacity: [0.3, 0.5, 0.3], scaleX: [0.96, 1.04, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: ambientEase }}
      />

      <img
        src={jarImage}
        alt=""
        draggable={false}
        className="relative z-10 h-full w-full select-none object-contain"
      />

      {!empty && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 overflow-hidden"
          style={{
            left: '33%',
            right: '33%',
            top: '40%',
            bottom: '18.5%',
            borderRadius: '10% 10% 44% 44% / 5% 5% 18% 18%',
          }}
        >
          <ChitPile />
        </div>
      )}
    </div>
  )
}

function ChitPile() {
  return (
    <div className="relative h-full w-full">
      {CHITS.map((chit, index) => (
        <motion.div
          key={`flat-${index}`}
          className="absolute origin-center rounded-[1px]"
          style={{
            left: chit.left,
            top: chit.top,
            width: chit.w,
            aspectRatio: '1.35 / 1',
            rotate: chit.yaw,
            scaleY: chit.sy,
            background:
              'linear-gradient(160deg, #f8f2e8 0%, #eee4d4 48%, #dccfb8 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.55), 0 0.5px 1px rgba(40,25,10,0.4)',
          }}
          animate={chit.drifts ? { y: [0, -1.2, 0] } : undefined}
          transition={
            chit.drifts
              ? {
                  duration: 7.2 + index * 0.1,
                  repeat: Infinity,
                  ease: ambientEase,
                  delay: chit.delay,
                }
              : undefined
          }
        />
      ))}

      {WALL_CHITS.map((chit, index) => (
        <motion.div
          key={`wall-${index}`}
          className="absolute z-10 origin-bottom rounded-[1px]"
          style={{
            left: chit.left,
            top: chit.top,
            width: chit.w,
            height: chit.h,
            rotate: chit.yaw,
            background:
              'linear-gradient(180deg, #f7f1e6 0%, #ebe1d0 55%, #d6c8b0 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(80,55,25,0.12), 0 1px 2px rgba(40,25,10,0.3)',
          }}
          animate={chit.drifts ? { y: [0, -0.8, 0] } : undefined}
          transition={
            chit.drifts
              ? {
                  duration: 8 + index * 0.2,
                  repeat: Infinity,
                  ease: ambientEase,
                  delay: chit.delay,
                }
              : undefined
          }
        >
          <div
            className="absolute inset-y-[10%] left-1/2 w-px -translate-x-1/2 opacity-40"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(150,130,100,0.5), transparent)',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
