import { useTheme } from '../contexts/ThemeContext'

interface Props {
  step:          number
  total:         number
  activeWidth?:  number
}

export function StepDots({ step, total, activeWidth = 20 }: Props) {
  const T = useTheme()
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i + 1 === step ? activeWidth : 6,
          height: 6, borderRadius: 3,
          background: i + 1 < step ? '#4ADE80' : i + 1 === step ? '#5B8CFF' : T.border2,
          transition: 'all .3s cubic-bezier(.16,1,.3,1)',
          boxShadow: i + 1 === step ? '0 0 8px rgba(91,140,255,.5)' : 'none',
        }} />
      ))}
    </div>
  )
}
