import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Custom heart cursor for fine pointers. Hidden on touch devices
 * so the system gesture cursor stays usable.
 */
export function HeartCursor() {
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [enabled, setEnabled] = useState(false)

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)
  const smoothX = useSpring(rawX, { stiffness: 520, damping: 32, mass: 0.35 })
  const smoothY = useSpring(rawY, { stiffness: 520, damping: 32, mass: 0.35 })
  // Hotspot near the heart's visual center
  const x = useTransform(smoothX, (value) => value - 14)
  const y = useTransform(smoothY, (value) => value - 14)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(finePointer.matches)
    update()
    finePointer.addEventListener('change', update)
    return () => finePointer.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add('heart-cursor')

    const onMove = (event: PointerEvent) => {
      rawX.set(event.clientX)
      rawY.set(event.clientY)
      setVisible(true)
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      document.documentElement.classList.remove('heart-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, rawX, rawY])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        animate={{ scale: pressed ? 0.82 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <HeartSvg />
      </motion.div>
    </motion.div>
  )
}

function HeartSvg() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
    >
      <rect x="2" y="2" width="2" height="1" fill="#FF6B8A" />
      <rect x="5" y="2" width="2" height="1" fill="#FF6B8A" />
      <rect x="1" y="3" width="1" height="1" fill="#FF6B8A" />
      <rect x="2" y="3" width="1" height="1" fill="#FF8FA8" />
      <rect x="3" y="3" width="2" height="1" fill="#FF6B8A" />
      <rect x="5" y="3" width="1" height="1" fill="#FF6B8A" />
      <rect x="6" y="3" width="1" height="1" fill="#FF8FA8" />
      <rect x="7" y="3" width="1" height="1" fill="#FF6B8A" />
      <rect x="1" y="4" width="3" height="1" fill="#FF6B8A" />
      <rect x="4" y="4" width="1" height="1" fill="#E84A6F" />
      <rect x="5" y="4" width="3" height="1" fill="#FF6B8A" />
      <rect x="2" y="5" width="2" height="1" fill="#FF6B8A" />
      <rect x="4" y="5" width="1" height="1" fill="#E84A6F" />
      <rect x="5" y="5" width="2" height="1" fill="#FF6B8A" />
      <rect x="3" y="6" width="1" height="1" fill="#FF6B8A" />
      <rect x="4" y="6" width="1" height="1" fill="#E84A6F" />
      <rect x="5" y="6" width="1" height="1" fill="#FF6B8A" />
      <rect x="4" y="7" width="1" height="1" fill="#FF6B8A" />
    </svg>
  )
}
