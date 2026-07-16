/** Turn Google Drive / Forms cell URLs into something <img> can load. */
export function normalizeMemoryImageUrl(raw: string | null | undefined): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined
  const value = raw.trim()
  if (!value) return undefined

  const fileId = extractDriveFileId(value)
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
  }

  // Already a direct image URL (Imgur, etc.)
  if (/^https?:\/\//i.test(value)) return value
  return undefined
}

function extractDriveFileId(value: string): string | null {
  const patterns = [
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}
