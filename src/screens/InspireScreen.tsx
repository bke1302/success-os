import { useState } from 'react'
import { X, ExternalLink, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { QUOTES, VIDEO_CARDS, CATEGORY_COLORS, type VideoCard } from '../constants'

// ─── YouTube overlay ──────────────────────────────────────────────────────────
function YouTubeOverlay({ card, onClose }: { card: VideoCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 20px', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 10px', cursor: 'pointer' }}>
          <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} strokeWidth={2} />
        </button>
        <div dir="rtl" className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 900, color: '#fff' }} className="truncate">{card.title}</p>
          <p className="label-xs">{card.speaker} · {card.duration}</p>
        </div>
      </div>
      <div className="flex-1 relative" style={{ background: '#000' }}>
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
    <div style={{ borderLeft: '3px solid rgba(245,196,53,0.6)', paddingLeft: 14 }}>
      <p className="label-xs mb-3" style={{ color: 'rgba(245,196,53,0.6)' }}>DAILY WISDOM</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(245,196,53,0.85)', lineHeight: 1.7, opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }} dir="rtl">
        "{QUOTES[idx]}"
      </p>
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => go(-1)} className="btn-ghost" style={{ padding: '6px 10px', borderRadius: 0 }}>
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <p className="label-xs">{idx + 1} / {QUOTES.length}</p>
        <button onClick={() => go(1)} className="btn-ghost" style={{ padding: '6px 10px', borderRadius: 0 }}>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ─── Video Item ───────────────────────────────────────────────────────────────
function VideoItem({ card, onPlay }: { card: VideoCard; onPlay: () => void }) {
  const color = CATEGORY_COLORS[card.category] ?? '#f5c435'
  const hasEmbed = !!card.youtubeId

  return (
    <div style={{ borderLeft: `3px solid ${color}55`, paddingLeft: 14 }}>
      <div className="flex items-start gap-3 mb-3">
        <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>{card.emoji}</span>
        <div className="flex-1 min-w-0" dir="rtl">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="label-xs" style={{ color }}>{card.category}</span>
            <span className="label-xs">{card.duration}</span>
            {hasEmbed && <span className="label-xs" style={{ color: 'rgba(34,197,94,0.7)' }}>IN-APP</span>}
          </div>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.35, marginBottom: 2 }}>{card.title}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: color + 'bb' }}>{card.speaker}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginTop: 4 }}>{card.subtitle}</p>
        </div>
      </div>

      {hasEmbed ? (
        <button onClick={onPlay}
          className="btn-red flex items-center justify-center gap-2"
          style={{ padding: '12px 16px', fontSize: 13, borderRadius: 0, width: '100%' }}
          dir="rtl">
          <Play className="w-4 h-4" fill="white" strokeWidth={0} />
          צפה עכשיו
        </button>
      ) : (
        <a href={card.searchUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 no-underline"
          style={{
            display: 'flex', padding: '12px 16px', fontSize: 13, fontWeight: 700,
            background: 'transparent', border: `1px solid ${color}30`, color,
            cursor: 'pointer',
          }}
          dir="rtl">
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          חפש ביוטיוב
        </a>
      )}
    </div>
  )
}

// ─── Main InspireScreen ───────────────────────────────────────────────────────
export function InspireScreen() {
  const [activeVideo, setActiveVideo] = useState<VideoCard | null>(null)

  const embedVideos  = VIDEO_CARDS.filter(v => v.youtubeId)
  const searchVideos = VIDEO_CARDS.filter(v => !v.youtubeId)

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      {activeVideo && (
        <YouTubeOverlay card={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Header */}
      <div className="shrink-0" style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="label-xs mb-2" style={{ color: 'rgba(239,68,68,0.7)' }}>INSPIRE</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }} dir="rtl">השראה יומית</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }} dir="rtl">
          מילים שמזיזות. סרטונים שמשנים. בחר אחד ותצא לדרך.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 32px' }}>

        {/* Quote */}
        <div className="mx-5 mt-5 mb-6">
          <QuoteSection />
        </div>

        <div style={{ margin: '0 20px', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* In-app videos */}
        {embedVideos.length > 0 && (
          <div className="mx-5 mt-5 mb-5">
            <p className="label-xs mb-4" style={{ color: 'rgba(34,197,94,0.7)' }}>▶ צפייה ישירה — בתוך האפליקציה</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {embedVideos.map(card => (
                <VideoItem key={card.id} card={card} onPlay={() => setActiveVideo(card)} />
              ))}
            </div>
          </div>
        )}

        {(embedVideos.length > 0 && searchVideos.length > 0) && (
          <div style={{ margin: '0 20px', height: 1, background: 'rgba(255,255,255,0.08)' }} />
        )}

        {/* YouTube search videos */}
        {searchVideos.length > 0 && (
          <div className="mx-5 mt-5">
            <p className="label-xs mb-4">🔗 חיפוש ביוטיוב</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
