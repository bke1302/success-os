export function ChartBackground() {
  const bars = [18, 28, 22, 38, 32, 52, 44, 61, 55, 72, 66, 80, 74, 90, 85, 95]
  const W = 1200
  const H = 340
  const barW = 48
  const gap  = 28

  return (
    <div
      className="fixed bottom-0 left-0 right-14 pointer-events-none z-0 overflow-hidden"
      style={{ height: '55vh' }}
      aria-hidden
    >
      {/* Gold glow layer */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, rgba(212,164,58,0.08), transparent)',
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax meet"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f5c842" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6b4e18" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {bars.map((pct, i) => {
          const barH = (pct / 100) * H
          const x    = i * (barW + gap) + gap
          const y    = H - barH
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill="url(#barGold)"
              rx={6}
              opacity={0.22 + (i / bars.length) * 0.16}
            />
          )
        })}

        {/* Horizontal base line */}
        <line
          x1={gap}
          y1={H - 1}
          x2={bars.length * (barW + gap)}
          y2={H - 1}
          stroke="#d4a43a"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
