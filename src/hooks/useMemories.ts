import { useEffect, useState } from 'react'
import { DEMO_MEMORIES } from '../data/demoMemories'
import type { Memory } from '../types'

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.message === 'string' &&
    (candidate.author === undefined || typeof candidate.author === 'string') &&
    (candidate.image === undefined || typeof candidate.image === 'string')
  )
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
          setMemories(data)
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
