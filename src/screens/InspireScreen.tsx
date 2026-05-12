import { useState } from 'react'
import { X, ExternalLink, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { QUOTES, VIDEO_CARDS, CATEGORY_COLORS, type VideoCard } from '../constants'

// ─── YouTube overlay ──────────────────────────────────────────────────────────
function YouTubeOverlay({ card, onClose }: { card: VideoCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-4"
        style={{ background: 'rgba(2,2,10,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <X className="w-4 h-4 text-muted" strokeWidth={2} />
        </button>
        <div dir="rtl" className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{card.title}</p>
          <p className="text-[10px] text-muted">{card.speaker} · {card.duration}</p>
        </div>
      </div>
      <div className="flex-1 relative bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${card.youtubeId}?rel=0&playsinline=1&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}

// ─── Quote Carousel ───────────────────────────────────────────────────────────
function QuoteSection() {
  const [idx, setIdx] = useState(() => {
    const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000)
    return d % QUOTES.length
  })
  const [visible, setVisible] = useState(true)

  const go = (dir: 1 | -1) => {
    setVisible(false)
    setTimeout(() => {
      setIdx(i => (i + dir + QUOTES.length) % QUOTES.length)
      setVisible(true)
    }, 200)
  }

  return (
    <div
      className="mx-5 rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(245,196,53,0.09) 0%, rgba(2,2,10,0.8) 80%)',
        border: '1px solid rgba(245,196,53,0.18)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right,transparent,rgba(245,196,53,0.55),transparent)' }} />

      <p className="text-[7px] tracking-[5px] uppercase text-muted mb-4 text-center">DAILY WISDOM</p>

      <p
        className="text-base font-bold text-white leading-relaxed text-center transition-opacity duration-200"
        dir="rtl"
        style={{ opacity: visible ? 1 : 0, lineHeight: 1.8 }}
      >
        "{QUOTES[idx]}"
      </p>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => go(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <ChevronLeft className="w-4 h-4 text-muted" strokeWidth={1.5} />
        </button>
        <p className="text-[9px] text-muted tracking-widest">{idx + 1} / {QUOTES.length}</p>
        <button
          onClick={() => go(1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <ChevronRight className="w-4 h-4 text-muted" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoItem({ card, onPlay }: { card: VideoCard; onPlay: () => void }) {
  const color = CATEGORY_COLORS[card.category] ?? '#f5c435'
  const hasEmbed = !!card.youtubeId

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,10,21,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="h-px" style={{ background: `linear-gradient(to right,transparent,${color}55,transparent)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl shrink-0">{card.emoji}</span>
          <div className="flex-1 min-w-0" dir="rtl">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[7px] tracking-[2px] uppercase font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${color}18`, color }}
              >
                {card.category}
              </span>
              <span className="text-[9px] text-muted">{card.duration}</span>
              {hasEmbed && (
                <span className="text-[7px] tracking-[2px] uppercase font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                  באפליקציה
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white leading-snug mb-0.5">{card.title}</p>
            <p className="text-[10px] font-semibold" style={{ color: color + 'bb' }}>{card.speaker}</p>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.subtitle}</p>
          </div>
        </div>

        {hasEmbed ? (
          <button
            onClick={onPlay}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff',
              boxShadow: '0 0 18px rgba(239,68,68,0.22)',
            }}
            dir="rtl"
          >
            <Play className="w-4 h-4" fill="white" strokeWidth={0} />
            צפה עכשיו
          </button>
        ) : (
          <a
            href={card.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 no-underline transition-all active:scale-[0.98]"
            style={{
              background: `${color}0e`,
              border: `1px solid ${color}28`,
              color,
              display: 'flex',
            }}
            dir="rtl"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            חפש ביוטיוב
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Main InspireScreen ───────────────────────────────────────────────────────
export function InspireScreen() {
  const [activeVideo, setActiveVideo] = useState<VideoCard | null>(null)

  const embedVideos  = VIDEO_CARDS.filter(v => v.youtubeId)
  const searchVideos = VIDEO_CARDS.filter(v => !v.youtubeId)

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#02020a', display: 'flex', flexDirection: 'column' }}>

      {activeVideo && (
        <YouTubeOverlay card={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Header */}
      <div
        className="shrink-0 px-5 pt-8 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h1 className="font-display text-2xl font-black gold-text mb-1" dir="rtl">
          השראה יומית
        </h1>
        <p className="text-xs text-sub" dir="rtl">
          מילים שמזיזות. סרטונים שמשנים. בחר אחד ותצא לדרך.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 0 32px' }}>

        {/* Quote */}
        <div className="mb-5">
          <QuoteSection />
        </div>

        {/* In-app videos */}
        {embedVideos.length > 0 && (
          <div className="px-5 mb-5">
            <p className="text-[8px] tracking-[4px] uppercase text-muted mb-3" dir="rtl">
              ▶ צפייה ישירה — בתוך האפליקציה
            </p>
            <div className="flex flex-col gap-3">
              {embedVideos.map(card => (
                <VideoItem key={card.id} card={card} onPlay={() => setActiveVideo(card)} />
              ))}
            </div>
          </div>
        )}

        {/* YouTube search videos */}
        {searchVideos.length > 0 && (
          <div className="px-5">
            <p className="text-[8px] tracking-[4px] uppercase text-muted mb-3" dir="rtl">
              🔗 חיפוש ביוטיוב
            </p>
            <div className="flex flex-col gap-3">
              {searchVideos.map(card => (
                <VideoItem key={card.id} card={card} onPlay={() => {}} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
