// Canvas-based win card generator → PNG DataURL or Web Share

interface CardData {
  win:    string
  score:  number
  date:   string   // "יום שלישי, 12 במאי"
  streak: number
}

function scoreColor(s: number): string {
  if (s >= 9) return '#f5c435'
  if (s >= 7) return '#e8a020'
  if (s >= 5) return '#f97316'
  return '#ef4444'
}

export async function generateWinCard(data: CardData): Promise<string> {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── Background ────────────────────────────────────────────────────
  const bg = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, H * 0.5, H)
  bg.addColorStop(0,   '#111122')
  bg.addColorStop(0.6, '#06060f')
  bg.addColorStop(1,   '#02020a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ── Glow orb ──────────────────────────────────────────────────────
  const color = scoreColor(data.score)
  const orb = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, 350)
  orb.addColorStop(0,   color + '40')
  orb.addColorStop(1,   'transparent')
  ctx.fillStyle = orb
  ctx.fillRect(0, 0, W, H)

  // ── Top bar ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  roundRect(ctx, 60, 60, W - 120, 110, 24)
  ctx.fill()

  ctx.font = 'bold 28px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'left'
  ctx.fillText('SUCCESS OS ⚡', 100, 128)

  if (data.streak > 0) {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillStyle = '#f5c435'
    ctx.textAlign = 'right'
    ctx.fillText(`🔥 ${data.streak} STREAK`, W - 100, 128)
  }

  // ── Date ─────────────────────────────────────────────────────────
  ctx.font = '26px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.textAlign = 'center'
  ctx.fillText(data.date, W / 2, 240)

  // ── Score ring ────────────────────────────────────────────────────
  const cx = W / 2, cy = 380, r = 110
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 14
  ctx.stroke()

  const pct = data.score / 10
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
  ctx.strokeStyle = color
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = 28
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.font = 'bold 96px sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(String(data.score), cx, cy + 32)
  ctx.font = 'bold 26px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('/ 10', cx, cy + 68)

  // ── Label under score ─────────────────────────────────────────────
  ctx.font = 'bold 22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.textAlign = 'center'
  ctx.fillText('ציון גדילה יומי', cx, cy + 110)

  // ── Divider ───────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(120, 0, W - 120, 0)
  grad.addColorStop(0,   'transparent')
  grad.addColorStop(0.5, color + '60')
  grad.addColorStop(1,   'transparent')
  ctx.fillStyle = grad
  ctx.fillRect(120, 545, W - 240, 1)

  // ── Win text ──────────────────────────────────────────────────────
  ctx.font = 'bold 22px sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText('מה נתתי היום', cx, 600)

  ctx.font = '34px sans-serif'
  ctx.fillStyle = '#ffffff'
  wrapText(ctx, data.win, cx, 660, W - 180, 52)

  // ── Bottom tag ────────────────────────────────────────────────────
  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.textAlign = 'center'
  ctx.fillText('bke1302.github.io/success-os', cx, H - 60)

  return canvas.toDataURL('image/png')
}

export async function shareWinCard(data: CardData): Promise<void> {
  const dataUrl = await generateWinCard(data)

  // Try Web Share API first (mobile)
  if (navigator.share) {
    const res  = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], 'win.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'הניצחון שלי היום 🏆' })
      return
    }
  }
  // Fallback: download
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'win-card.png'
  a.click()
}

// ── Helpers ────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineH
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}
