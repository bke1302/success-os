import { useTheme } from '../contexts/ThemeContext'

interface Props {
  value: number
  onChange: (v: number) => void
  label?: string
  size?: 'sm' | 'lg'
  readonly?: boolean
}

const COLOR = (v: number) => {
  if (v <= 3) return { fill: '#ef4444', glow: 'rgba(239,68,68,0.5)' }
  if (v <= 6) return { fill: '#f97316', glow: 'rgba(249,115,22,0.4)' }
  if (v <= 8) return { fill: '#e8a020', glow: 'rgba(232,160,32,0.5)' }
  return           { fill: '#f5c435', glow: 'rgba(245,196,53,0.6)' }
}

const LABEL = (v: number) => {
  if (v <= 2) return 'אני מת...'
  if (v <= 4) return 'לא מרגיש הכי טוב'
  if (v <= 6) return 'בסדר, אפשר לעבוד'
  if (v <= 8) return 'חזק ומוכן'
  if (v === 9) return 'אש! בשיא כמעט'
  return 'אני בשיא המשחק!'
}

export function EnergySlider({ value, onChange, label, size = 'lg', readonly = false }: Props) {
  const T = useTheme()
  const { fill, glow } = COLOR(value)

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {label && (
        <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted" dir="rtl">{label}</p>
      )}

      {size === 'lg' && (
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-display leading-none transition-all duration-300"
            style={{ fontSize: '72px', color: fill, filter: `drop-shadow(0 0 20px ${glow})` }}
          >
            {value}
          </span>
          <span className="text-sm font-semibold" style={{ color: fill }} dir="rtl">
            {LABEL(value)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 justify-center flex-wrap">
        {Array.from({ length: 10 }, (_, i) => {
          const n     = i + 1
          const active = n <= value
          const { fill: dotFill, glow: dotGlow } = COLOR(n)

          return (
            <button
              key={n}
              onClick={() => !readonly && onChange(n)}
              disabled={readonly}
              aria-label={`ציון ${n}`}
              aria-pressed={n <= value}
              className="transition-all duration-200 font-bold flex items-center justify-center rounded-full"
              style={{
                width:      size === 'lg' ? '40px' : '22px',
                height:     size === 'lg' ? '40px' : '22px',
                fontSize:   size === 'lg' ? '13px' : '9px',
                background: active
                  ? `radial-gradient(circle, ${dotFill}, ${dotFill}cc)`
                  : T.tagBg,
                border:     active
                  ? `1px solid ${dotFill}`
                  : `1px solid ${T.border2}`,
                boxShadow:  active ? `0 0 12px ${dotGlow}` : 'none',
                color:      active ? '#000' : T.textDim,
                cursor:     readonly ? 'default' : 'pointer',
              }}
            >
              {size === 'lg' ? n : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
