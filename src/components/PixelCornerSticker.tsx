type PixelCornerStickerProps = {
  /** Stable per-memory seed so the sticker doesn't flicker across re-renders. */
  seed: string
}

type Pixel = [x: number, y: number, color: string]

/**
 * Tiny Figma-ish pixel stickers (heart, star, spark, bloom).
 * Drawn on a 12×12 grid and scaled with crisp pixel edges.
 */
const STICKERS: Pixel[][] = [
  // Heart
  [
    [2, 2, '#FF6B8A'],
    [3, 2, '#FF6B8A'],
    [5, 2, '#FF6B8A'],
    [6, 2, '#FF6B8A'],
    [1, 3, '#FF6B8A'],
    [2, 3, '#FF8FA8'],
    [3, 3, '#FF6B8A'],
    [4, 3, '#FF6B8A'],
    [5, 3, '#FF6B8A'],
    [6, 3, '#FF8FA8'],
    [7, 3, '#FF6B8A'],
    [1, 4, '#FF6B8A'],
    [2, 4, '#FF6B8A'],
    [3, 4, '#FF6B8A'],
    [4, 4, '#E84A6F'],
    [5, 4, '#FF6B8A'],
    [6, 4, '#FF6B8A'],
    [7, 4, '#FF6B8A'],
    [2, 5, '#FF6B8A'],
    [3, 5, '#FF6B8A'],
    [4, 5, '#E84A6F'],
    [5, 5, '#FF6B8A'],
    [6, 5, '#FF6B8A'],
    [3, 6, '#FF6B8A'],
    [4, 6, '#E84A6F'],
    [5, 6, '#FF6B8A'],
    [4, 7, '#FF6B8A'],
  ],
  // Star
  [
    [5, 1, '#F5C542'],
    [5, 2, '#F5C542'],
    [2, 3, '#F5C542'],
    [3, 3, '#F5C542'],
    [4, 3, '#F5C542'],
    [5, 3, '#FFE08A'],
    [6, 3, '#F5C542'],
    [7, 3, '#F5C542'],
    [8, 3, '#F5C542'],
    [3, 4, '#F5C542'],
    [4, 4, '#FFE08A'],
    [5, 4, '#F5C542'],
    [6, 4, '#FFE08A'],
    [7, 4, '#F5C542'],
    [4, 5, '#F5C542'],
    [5, 5, '#E0A820'],
    [6, 5, '#F5C542'],
    [3, 6, '#F5C542'],
    [5, 6, '#F5C542'],
    [7, 6, '#F5C542'],
    [2, 7, '#F5C542'],
    [8, 7, '#F5C542'],
  ],
  // Spark / gem
  [
    [5, 1, '#7C5CFF'],
    [4, 2, '#7C5CFF'],
    [5, 2, '#B8A4FF'],
    [6, 2, '#7C5CFF'],
    [3, 3, '#7C5CFF'],
    [4, 3, '#B8A4FF'],
    [5, 3, '#FFFFFF'],
    [6, 3, '#B8A4FF'],
    [7, 3, '#7C5CFF'],
    [4, 4, '#7C5CFF'],
    [5, 4, '#B8A4FF'],
    [6, 4, '#7C5CFF'],
    [5, 5, '#7C5CFF'],
    [2, 2, '#0ACF83'],
    [8, 2, '#0ACF83'],
    [1, 5, '#0ACF83'],
    [9, 5, '#0ACF83'],
    [2, 8, '#0ACF83'],
    [8, 8, '#0ACF83'],
    [5, 7, '#7C5CFF'],
    [5, 8, '#7C5CFF'],
  ],
  // Little bloom
  [
    [5, 1, '#FF7262'],
    [4, 2, '#FF7262'],
    [5, 2, '#FFA08A'],
    [6, 2, '#FF7262'],
    [3, 3, '#FF7262'],
    [4, 3, '#FFA08A'],
    [5, 3, '#F5C542'],
    [6, 3, '#FFA08A'],
    [7, 3, '#FF7262'],
    [4, 4, '#FF7262'],
    [5, 4, '#FFA08A'],
    [6, 4, '#FF7262'],
    [5, 5, '#FF7262'],
    [5, 6, '#0ACF83'],
    [5, 7, '#0ACF83'],
    [4, 8, '#0ACF83'],
    [5, 8, '#0ACF83'],
    [6, 8, '#0ACF83'],
    [3, 9, '#1BC47D'],
    [7, 9, '#1BC47D'],
  ],
]

function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

export function PixelCornerSticker({ seed }: PixelCornerStickerProps) {
  const index = hashSeed(seed) % STICKERS.length
  const pixels = STICKERS[index]!

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className="drop-shadow-[1px_1px_0_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      {pixels.map(([x, y, color], i) => (
        <rect key={`${x}-${y}-${i}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  )
}
