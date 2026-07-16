import type { Memory } from '../types'

/** Fisher–Yates shuffle — returns a new array (session-only, in-memory). */
export function shuffleMemories(memories: Memory[]): Memory[] {
  const deck = [...memories]
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = deck[i]!
    const b = deck[j]!
    deck[i] = b
    deck[j] = a
  }
  return deck
}
