import { useState } from 'react'
import { X, ExternalLink, Play, ChevronLeft, ChevronRight, Dumbbell, Brain, Target, Flame, BookOpen } from 'lucide-react'
import { QUOTES, VIDEO_CARDS, CATEGORY_COLORS, type VideoCard } from '../constants'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'כושר':    <Dumbbell className="w-5 h-5" strokeWidth={1.5} />,
  'מנטליות': <Brain    className="w-5 h-5" strokeWidth={1.5} />,
  'מטרות':   <Target   className="w-5 h-5" strokeWidth={1.5} />,
  'הצלחה':   <Flame    className="w-5 h-5" strokeWidth={1.5} />,
}
const DefaultIcon = <BookOpen className="w-5 h-5" strokeWidth={1.5} />

function YouTubeOverlay({ card, onClose }: { card: VideoCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 20px', background: '#000', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <button onClick={onClose} className="btn-ghost" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
        <div dir="rtl" className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 900, color: '#f2f2f7' }} className="truncate">{card.title}</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>{card.speaker} · {card.duration}</p>
        </div>
      </div>
      <div className="flex-1 relative" style={{ background: '#000' }}>
        <iframe src={`https://www.youtube.com/embed/${card.youtubeId}?rel=0&playsinline=1&modestbranding=1`}
          className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ border: 'none' }} />
      </div>
    </div>
  )
}

function QuoteSection() {
  const [idx, setIdx] = useState(() => {
    const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000)
    return d % QUOTES.length
  })
  const [visible, setVisible] = useState(true)
  const go = (dir: 1 | -1) => {
    setVisible(false)
    setTimeout(() => { setIdx(i => (i + dir + QUOTES.length) % QUOTES.length); setVisible(true) }, 200)
  }
  return (
    <div className="card" style={{ borderRight: '3px solid rgba(255,214,10,.5)' }}>
      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase', marginBottom: 12 }}>DAILY WISDOM</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(245,196,53,0.9)', lineHeight: 1.7, opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }} dir="rtl">
        "{QUOTES[idx]}"
      </p>
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => go(-1)} className="btn-ghost" style={{ padding: '6px 10px' }}><ChevronLeft className="w-4 h-4" strokeWidth={1.5} /></button>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>{idx + 1} / {QUOTES.length}</p>
        <button onClick={() => go(1)} className="btn-ghost" style={{ padding: '6px 10px' }}><ChevronRight className="w-4 h-4" strokeWidth={1.5} /></button>
      </div>
    </div>
  )
}

function VideoItem({ card, onPlay }: { card: VideoCard; onPlay: () => void }) {
  const color = CATEGORY_COLORS[card.category] ?? '#FFD60A'
  const hasEmbed = !!card.youtubeId
  const icon = CATEGORY_ICONS[card.category] ?? DefaultIcon
  return (
    <div className="card" style={{ borderRight: `3px solid ${color}55` }}>
      <div className="flex items-start gap-3 mb-3">
        <span style={{ color: color + '99', marginTop: 2, flexShrink: 0 }}>{icon}</span>
        <div className="flex-1 min-w-0" dir="rtl">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color, textTransform: 'uppercase' }}>{card.category}</span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>{card.duration}</span>
            {hasEmbed && <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#22c55e', textTransform: 'uppercase' }}>IN-APP</span>}
          </div>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#f2f2f7', lineHeight: 1.35, marginBottom: 2 }}>{card.title}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: color + 'bb' }}>{card.speaker}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.5, marginTop: 4 }}>{card.subtitle}</p>
        </div>
      </div>
      {hasEmbed ? (
        <button onClick={onPlay} className="btn-red w-full flex items-center justify-center gap-2" style={{ padding: '12px', fontSize: 13 }} dir="rtl">
          <Play className="w-4 h-4" fill="white" strokeWidth={0} />צפה עכשיו
        </button>
      ) : (
        <a href={card.searchUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', padding: '12px', fontSize: 13, fontWeight: 700, background: 'transparent', border: `1px solid ${color}30`, color, cursor: 'pointer', borderRadius: 12, textDecoration: 'none', alignItems: 'center', justifyContent: 'center', gap: 8 }} dir="rtl">
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />חפש ביוטיוב
        </a>
      )}
    </div>
  )
}

export function InspireScreen() {
  const [activeVideo, setActiveVideo] = useState<VideoCard | null>(null)
  const embedVideos  = VIDEO_CARDS.filter(v => v.youtubeId)
  const searchVideos = VIDEO_CARDS.filter(v => !v.youtubeId)
  return (
    <div style={{ height: '100%', overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {activeVideo && <YouTubeOverlay card={activeVideo} onClose={() => setActiveVideo(null)} />}
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>INSPIRE</p>
        <h1 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 32, fontWeight: 900, color: '#f2f2f7', lineHeight: 1.05 }} dir="rtl">השראה</h1>
        <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: 'rgba(255,255,255,.35)', marginTop: 4 }} dir="rtl">מילים שמזיזות. סרטונים שמשנים.</p>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>
        <div style={{ marginBottom: 20 }}><QuoteSection /></div>
        <div style={{ height: 1, background: 'rgba(255,255,255,.07)', marginBottom: 20 }} />
        {embedVideos.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(34,197,94,0.6)', textTransform: 'uppercase', marginBottom: 14 }}>צפייה ישירה</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {embedVideos.map(card => <VideoItem key={card.id} card={card} onPlay={() => setActiveVideo(card)} />)}
            </div>
          </>
        )}
        {searchVideos.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginBottom: 14 }}>חיפוש ביוטיוב</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {searchVideos.map(card => <VideoItem key={card.id} card={card} onPlay={() => {}} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
