import type { Memory } from '../types'
import { PixelCornerSticker } from './PixelCornerSticker'

type MemoryCardProps = {
  memory: Memory
  /** Soften content while the note is still folding open/closed. */
  contentVisible?: boolean
}

export function MemoryCard({ memory, contentVisible = true }: MemoryCardProps) {
  return (
    <article
      className="relative w-[min(92vw,26rem)] max-w-full origin-center overflow-hidden px-6 pb-9 pt-11 text-left shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:px-8 sm:pb-10 sm:pt-12"
      style={{
        background:
          'linear-gradient(165deg, #f7f1e6 0%, #f3ebdd 42%, #ebe2d2 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.65), 0 24px 48px rgba(0,0,0,0.45), 0 2px 6px rgba(60,40,20,0.15)',
      }}
    >
      {/* Soft paper fiber */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,100,70,0.03) 2px, rgba(120,100,70,0.03) 3px)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 z-10"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <PixelCornerSticker seed={memory.id} />
      </div>

      <div
        className="relative min-w-0 max-w-full transition-opacity duration-300"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        {memory.image && (
          <figure className="mb-7 max-w-full">
            <img
              src={memory.image}
              alt=""
              className="h-auto max-h-56 w-full max-w-full object-cover"
              style={{
                boxShadow:
                  '0 1px 2px rgba(60,40,20,0.2), 0 8px 16px rgba(60,40,20,0.12)',
                border: '4px solid #f5efe4',
              }}
            />
          </figure>
        )}

        <p className="max-w-full break-words font-signature text-[1.35rem] leading-[1.55] text-[#3d3428] whitespace-pre-wrap [overflow-wrap:anywhere] sm:text-[1.45rem]">
          {memory.message}
        </p>

        {memory.author && (
          <p className="mt-7 max-w-full break-words font-signature text-[1.7rem] leading-snug text-[#5c4a38] [overflow-wrap:anywhere] sm:mt-8 sm:text-[1.85rem]">
            — {memory.author}
          </p>
        )}
      </div>
    </article>
  )
}
