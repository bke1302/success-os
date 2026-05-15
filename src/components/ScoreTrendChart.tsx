import { useRef, useEffect, useMemo } from 'react'
import type { DayEntry } from '../types'

interface Props {
  entries: DayEntry[]
}

const DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

function barColor(score: number): string {
  if (score >= 7) return '#FFD60A'
  if (score >= 5) return '#FF9F0A'
  return '#FF375F'
}

export function ScoreTrendChart({ entries }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const last14 = useMemo(() => {
    return [...entries]
      .filter(e => e.evening)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
  }, [entries])

  const draw = () => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const cssW = wrapper.offsetWidth
    const cssH = 80
    canvas.width  = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width  = `${cssW}px`
    canvas.style.height = `${cssH}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, cssW, cssH)

    if (last14.length === 0) return

    const leftPad   = 18
    const rightPad  = 6
    const topPad    = 6
    const bottomPad = 18
    const chartW    = cssW - leftPad - rightPad
    const chartH    = cssH - topPad - bottomPad
    const colW      = chartW / last14.length
    const barW      = colW * 0.6

    // Y gridlines at 5 and 7
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ;[5, 7].forEach(score => {
      const y = topPad + chartH - (score / 10) * chartH
      ctx.beginPath()
      ctx.moveTo(leftPad, y)
      ctx.lineTo(leftPad + chartW, y)
      ctx.stroke()
      // Y label
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = `${8 * dpr / dpr}px sans-serif`
      ctx.textAlign = 'right'
      ctx.fillText(String(score), leftPad - 3, y + 3)
    })
    ctx.setLineDash([])

    // Bars
    last14.forEach((entry, i) => {
      const score  = entry.evening!.score
      const color  = barColor(score)
      const barH   = (score / 10) * chartH
      const x      = leftPad + i * colW + (colW - barW) / 2
      const y      = topPad + chartH - barH

      // Glow
      ctx.shadowColor = color
      ctx.shadowBlur  = 8

      ctx.fillStyle = color
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barH, 3)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, barW, barH)
      }
      ctx.shadowBlur = 0

      // X label — Hebrew day letter
      const [yr, mo, dy] = entry.date.split('-').map(Number)
      const dayIdx = new Date(yr, mo - 1, dy).getDay()
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font      = `${9 * dpr / dpr}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(DAY_LETTERS[dayIdx], x + barW / 2, cssH - 3)
    })

    // Trend line across bar tops
    if (last14.length >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1.5
      last14.forEach((entry, i) => {
        const score = entry.evening!.score
        const barH  = (score / 10) * chartH
        const x     = leftPad + i * colW + colW / 2
        const y     = topPad + chartH - barH
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }

  useEffect(() => {
    draw()
    const observer = new ResizeObserver(() => draw())
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last14])

  if (last14.length < 2) return null

  return (
    <div
      className="rounded-2xl px-4 pt-4 pb-2 mt-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[8px] tracking-[3px] uppercase text-muted mb-3" dir="rtl">
        {last14.length} ימים אחרונים — מסלול הגדילה שלך
      </p>
      <div ref={wrapperRef} className="w-full">
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>
    </div>
  )
}
