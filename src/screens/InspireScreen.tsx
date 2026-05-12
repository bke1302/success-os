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
        <button onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <X className="w-4 h-4 text-muted" strokeWidth={2} />
        </button>
        <div dir="rtl" className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{card.title}</p>
          <p className="text-[10px] text-muted">{card.speaker} · {card.duration}</p>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe
          src={`https://www.youtube.com/embed/${card.youtubeId}?autoplay=1&rel=0&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}

// ─── Quote Card (swipeable) ───────────────────────────────────────────────────
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
      className="mx-6 rounded-3xl p-7 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,196,53,0.1) 0%, rgba(2,2,10,0.8) 80%)', border: '1px solid rgba(245,196,53,0.2)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right,transparent,rgba(245,196,53,0.6),transparent)' }} />

      <p className="text-[8px] tracking-[4px] uppercase text-muted mb-4 text-center">
        DAILY WISDOM
      </p>

      <p
        className="text-lg font-bold text-white leading-relaxed text-center transition-opacity duration-200"
        dir="rtl"
        style={{ opacity: visible ? 1 : 0, lineHeight: 1.75 }}
      >
        "{QUOTES[idx]}"
      </p>

      {/* Nav */}
      <div className="flex items-center justify-between mt-5">
        <button onClick={() => go(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ChevronLeft className="w-4 h-4 text-muted" strokeWidth={1.5} />
        </button>
        <p className="text-[9px] text-muted tracking-widest">
          {idx + 1} / {QUOTES.length}
        </p>
        <button onClick={() => go(1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ChevronRight className="w-4 h-4 text-muted" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ─── Main InspireScreen ───────────────────────────────────────────────────────
export function InspireScreen() {
  const [activeVideo, setActiveVideo] = useState<VideoCard | null>(null)

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

      {activeVideo && (
        <YouTubeOverlay card={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h1 className="font-display text-3xl md:text-4xl gold-text mb-1" dir="rtl">
          השראה יומית
        </h1>
        <p className="text-sm text-sub" dir="rtl">
          מילים שמזיזות. סרטונים שמשנים. בחר אחד ותצא לדרך.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">

        {/* Quote section */}
        <QuoteSection />

        {/* Videos section */}
        <div className="px-6 flex flex-col gap-3">
          <p className="text-[9px] tracking-[4px] uppercase text-muted" dir="rtl">
            סרטוני מוטיבציה — מהטובים בעולם
          </p>

          {VIDEO_CARDS.map(card => {
            const color = CATEGORY_COLORS[card.category] ?? '#f5c435'
            return (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0a0a15', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Accent line */}
                <div className="h-px" style={{ background: `linear-gradient(to right,transparent,${color}60,transparent)` }} />

                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl shrink-0">{card.emoji}</span>
                    <div className="flex-1 min-w-0" dir="rtl">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[8px] tracking-[2px] uppercase font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${color}18`, color }}
                        >
                          {card.category}
                        </span>
                        <span className="text-[9px] text-muted">{card.duration}</span>
                      </div>
                      <p className="text-base font-bold text-white leading-tight mb-1">{card.title}</p>
                      <p className="text-[11px] text-muted font-semibold">{card.speaker}</p>
                      <p className="text-xs text-sub leading-relaxed mt-1.5">{card.subtitle}</p>
                    </div>
                  </div>

                  {/* Action */}
                  {card.youtubeId ? (
                    <button
                      onClick={() => setActiveVideo(card)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                        color: '#fff',
                        boxShadow: '0 0 18px rgba(239,68,68,0.25)',
                      }}
                      dir="rtl"
                    >
                      <Play className="w-4 h-4" fill="white" strokeWidth={0} />
                      צפה עכשיו באפליקציה
                    </button>
                  ) : (
                    <a
                      href={card.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 no-underline transition-all"
                      style={{
                        background: `${color}12`,
                        border: `1px solid ${color}35`,
                        color,
                        display: 'flex',
                      }}
                      dir="rtl"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      חפש ב-YouTube
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
