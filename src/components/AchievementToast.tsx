import type { Achievement } from '../hooks/useAchievements'

interface Props {
  achievement: Achievement | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  if (!achievement) return null

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a1628, #0f0d1c)',
        border: '1px solid rgba(232,160,32,0.5)',
        boxShadow: '0 0 40px rgba(232,160,32,0.2), 0 20px 60px rgba(0,0,0,0.6)',
        animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: '90vw',
      }}
      onClick={onDismiss}
    >
      {/* Gold top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.9), transparent)' }}
      />

      {/* Icon */}
      <div
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)' }}
      >
        {achievement.icon}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-[8px] tracking-[4px] uppercase font-bold mb-1" style={{ color: '#e8a020' }}>
          ACHIEVEMENT UNLOCKED
        </p>
        <p className="text-base font-bold text-white leading-tight" dir="rtl">{achievement.name}</p>
        <p className="text-xs text-muted mt-0.5" dir="rtl">{achievement.desc}</p>
      </div>
    </div>
  )
}
