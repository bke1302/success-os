import { useState } from 'react'
import { Zap, Trophy, Flame } from 'lucide-react'
import { useAppData, getDayPhase } from './hooks/useAppData'
import { MorningPrime }  from './screens/MorningPrime'
import { DayScreen }     from './screens/DayScreen'
import { EveningReview } from './screens/EveningReview'
import { WinsWall }      from './screens/WinsWall'
import { FireScreen }    from './screens/FireScreen'

export default function App() {
  const { state, today, saveMorning, saveEvening, setView } = useAppData()
  const [forceEvening, setForceEvening] = useState(false)

  const phase    = getDayPhase()
  const dayCount = state.entries.length + 1

  const primeScreen = (): 'morning' | 'day' | 'evening' | 'done' => {
    if (!today?.morning)                     return 'morning'
    if (today?.evening)                      return 'done'
    if (forceEvening || phase === 'evening') return 'evening'
    return 'day'
  }

  const screen = primeScreen()

  return (
    <div style={{ background: '#02020a', minHeight: '100dvh' }}>

      {/* ── PRIME ─────────────────────────────────────────── */}
      {state.currentView === 'prime' && (
        <>
          {screen === 'morning' && (
            <MorningPrime onComplete={saveMorning} dayCount={dayCount} />
          )}
          {screen === 'day' && (
            <DayScreen
              commitment={today!.morning!.commitment}
              identity={today!.morning!.identity}
              purpose={today!.morning!.purpose}
              onFinishDay={() => setForceEvening(true)}
              streak={state.streak}
              dayCount={dayCount}
            />
          )}
          {screen === 'evening' && (
            <EveningReview
              commitment={today?.morning?.commitment ?? ''}
              identity={today?.morning?.identity}
              onComplete={(data) => { saveEvening(data); setForceEvening(false) }}
            />
          )}
          {screen === 'done' && (
            <DayScreen
              commitment={today!.morning!.commitment}
              identity={today!.morning!.identity}
              purpose={today!.morning!.purpose}
              evening={today!.evening}
              onFinishDay={() => {}}
              streak={state.streak}
              dayCount={dayCount}
            />
          )}
        </>
      )}

      {/* ── FIRE ─────────────────────────────────────────── */}
      {state.currentView === 'fire' && <FireScreen />}

      {/* ── WINS ─────────────────────────────────────────── */}
      {state.currentView === 'wins' && (
        <WinsWall entries={state.entries} streak={state.streak} totalDays={state.totalDays} />
      )}

      {/* ── Bottom navigation ────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center z-30"
        style={{
          height: '64px',
          background: 'rgba(2,2,10,0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {(
          [
            { id: 'prime', label: 'PRIME',  Icon: Zap,   activeColor: '#f5c435' },
            { id: 'fire',  label: 'FIRE',   Icon: Flame, activeColor: '#ef4444' },
            { id: 'wins',  label: 'GROWTH', Icon: Trophy,activeColor: '#f5c435' },
          ] as const
        ).map(({ id, label, Icon, activeColor }) => {
          const active = state.currentView === id
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-150 relative"
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? activeColor : '#4a4868' }}
              />
              <span
                className="text-[8px] tracking-[2px] font-bold uppercase"
                style={{ color: active ? activeColor : '#4a4868' }}
              >
                {label}
              </span>
              {active && (
                <div
                  className="absolute bottom-0 w-8 h-0.5 rounded-t-full"
                  style={{ background: `linear-gradient(90deg,${activeColor}99,${activeColor})` }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <div style={{ height: '64px' }} />
    </div>
  )
}
