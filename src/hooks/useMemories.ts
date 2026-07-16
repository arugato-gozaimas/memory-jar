import { useEffect, useState } from 'react'
import { DEMO_MEMORIES } from '../data/demoMemories'
import { normalizeMemoryImageUrl } from '../lib/memoryImage'
import type { Memory } from '../types'

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const imageOk =
    candidate.image === undefined ||
    candidate.image === null ||
    typeof candidate.image === 'string'
  const authorOk =
    candidate.author === undefined ||
    candidate.author === null ||
    typeof candidate.author === 'string'

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.message === 'string' &&
    authorOk &&
    imageOk
  )
}

function normalizeMemory(raw: Memory): Memory {
  const image = normalizeMemoryImageUrl(raw.image)
  const author =
    typeof raw.author === 'string' && raw.author.trim()
      ? raw.author.trim()
      : undefined

  return {
    id: raw.id,
    message: raw.message,
    ...(author ? { author } : {}),
    ...(image ? { image } : {}),
  }
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const endpoint = import.meta.env.VITE_MEMORIES_ENDPOINT?.trim()

    // Local preview until the Apps Script URL is pasted into .env
    if (!endpoint || endpoint.includes('YOUR_DEPLOYMENT_ID')) {
      setMemories(DEMO_MEMORIES)
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`The jar could not be reached (${response.status}).`)
        }

        const data: unknown = await response.json()
        if (!Array.isArray(data) || !data.every(isMemory)) {
          throw new Error('The jar returned something unexpected.')
        }

        if (!cancelled) {
          setMemories(data.map(normalizeMemory))
          setError(null)
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('The jar is still settling. Try refreshing in a moment.')
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { memories, isLoading, error }
}
