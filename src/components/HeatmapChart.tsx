import { useRef, useEffect } from 'react'
import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { scoreColor } from '../utils/colorUtils'

interface Props { entries: DayEntry[] }

const HEBREW_DAYS = ['א','ב','ג','ד','ה','ו','ש']

function getDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export function HeatmapChart({ entries }: Props) {
  const T        = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)

  const scoreMap: Record<string, number> = {}
  for (const e of entries) {
    if (e.evening) scoreMap[e.date] = e.evening.score
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return

    const dpr = window.devicePixelRatio || 1
    const W   = wrap.offsetWidth
    const COLS = 15
    const ROWS = 7
    const CELL = Math.floor((W - 40) / COLS)
    const GAP  = 3
    const H    = ROWS * (CELL + GAP) + 32

    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    canvas.width  = W * dpr
    canvas.height = H * dpr

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const labelColor = T.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
    const emptyColor = T.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'

    const today = new Date()
    const todayDow = today.getDay()

    // Day-of-week labels
    ctx.font = `bold 9px sans-serif`
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    for (let r = 0; r < ROWS; r++) {
      const y = r * (CELL + GAP) + CELL / 2 + 4
      ctx.fillText(HEBREW_DAYS[r], 18, y)
    }

    const startX = 24

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const colsFromEnd = COLS - 1 - col
        const daysFromToday = colsFromEnd * 7 + (todayDow - row + 7) % 7
        const dateStr = getDateStr(daysFromToday)
        const score   = scoreMap[dateStr]
        const isFuture = daysFromToday < 0

        const x = startX + col * (CELL + GAP)
        const y = row * (CELL + GAP)
        const r = 3

        ctx.beginPath()
        ctx.roundRect(x, y, CELL, CELL, r)

        if (isFuture || daysFromToday > 90) {
          ctx.fillStyle = 'rgba(0,0,0,0)'
        } else if (score !== undefined) {
          ctx.fillStyle = scoreColor(score)
          ctx.shadowColor = scoreColor(score)
          ctx.shadowBlur  = score >= 7 ? 6 : 0
        } else {
          ctx.fillStyle = emptyColor
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Month labels
    ctx.font = '9px sans-serif'
    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    let lastMonth = -1
    for (let col = 0; col < COLS; col++) {
      const daysAgo = (COLS - 1 - col) * 7
      const d = new Date(); d.setDate(d.getDate() - daysAgo)
      const month = d.getMonth()
      if (month !== lastMonth) {
        const x = startX + col * (CELL + GAP)
        ctx.fillText(d.toLocaleDateString('he-IL', { month: 'short' }), x, H - 4)
        lastMonth = month
      }
    }

  }, [entries, T.isDark])

  const emptyLegendColor = T.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'

  return (
    <div ref={wrapRef} style={{ width: '100%', marginTop: 12 }}>
      <p className="text-[7px] tracking-[4px] uppercase text-muted mb-2">15 שבועות אחרונים</p>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 justify-end">
        {[['פחות', emptyLegendColor], ['5-6','#FF375F'], ['7-8','#FF9F0A'], ['9-10','#FFD60A']].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span className="text-[8px] text-muted">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
