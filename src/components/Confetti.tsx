import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  color: string
  w: number; h: number
  rotation: number; rotSpeed: number
  opacity: number
}

const COLORS = ['#f5c435', '#e8a020', '#ffffff', '#ffd700', '#ff9500', '#ffe066', '#ffcf40']

function rand(min: number, max: number) { return Math.random() * (max - min) + min }

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const alreadyRan = useRef(false)

  useEffect(() => {
    if (!active) { alreadyRan.current = false; return }
    if (alreadyRan.current) return
    alreadyRan.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    particlesRef.current = Array.from({ length: 120 }, () => ({
      x:        rand(0, canvas.width),
      y:        rand(-canvas.height * 0.3, -10),
      vx:       rand(-3, 3),
      vy:       rand(2, 6),
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      w:        rand(6, 14),
      h:        rand(4, 8),
      rotation: rand(0, 360),
      rotSpeed: rand(-8, 8),
      opacity:  1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0

      for (const p of particlesRef.current) {
        if (p.opacity <= 0) continue
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.08 // gravity
        p.vx *= 0.99 // drag
        p.rotation += p.rotSpeed
        if (p.y > canvas.height * 0.6) p.opacity -= 0.025
        else                           p.opacity -= 0.004

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()

        if (p.opacity > 0) alive++
      }

      if (alive > 0) rafRef.current = requestAnimationFrame(animate)
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    />
  )
}
