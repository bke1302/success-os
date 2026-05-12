import { useState } from 'react'
import { Zap, CheckSquare, Play, Trophy } from 'lucide-react'
import { useAppData, getDayPhase } from './hooks/useAppData'
import { HABITS } from './constants'
import { getTodayRequiredHabitIds } from './data/program'
import { MorningPrime }   from './screens/MorningPrime'
import { DayScreen }      from './screens/DayScreen'
import { EveningReview }  from './screens/EveningReview'
import { ActionsScreen }  from './screens/ActionsScreen'
import { InspireScreen }  from './screens/InspireScreen'
import { WinsWall }       from './screens/WinsWall'

export default function App() {
  const { state, today, saveMorning, saveEvening, saveHabits, setView } = useAppData()
  const [forceEvening, setForceEvening] = useState(false)

  const phase    = getDayPhase()
  const dayCount = state.entries.length + 1

  // Yesterday's date string + data
  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()
  const yesterdayEntry      = state.entries.find(e => e.date === yesterday)
  const lastWin             = yesterdayEntry?.evening?.given ?? yesterdayEntry?.evening?.win
  const yesterdayHabitsPct  = yesterdayEntry?.habits
    ? yesterdayEntry.habits.length / HABITS.length
    : 0

  // Today's required habit IDs from the rotating program
  const requiredHabitIds = getTodayRequiredHabitIds(dayCount)

  const primeScreen = (): 'morning' | 'day' | 'evening' | 'done' => {
    if (!today?.morning)                     return 'morning'
    if (today?.evening)                      return 'done'
    if (forceEvening || phase === 'evening') return 'evening'
    return 'day'
  }

  const screen = primeScreen()

  const NAV = [
    { id: 'prime',   label: 'PRIME',    Icon: Zap,         color: '#f5c435' },
    { id: 'actions', label: 'ACTIONS',  Icon: CheckSquare, color: '#22c55e' },
    { id: 'inspire', label: 'INSPIRE',  Icon: Play,        color: '#ef4444' },
    { id: 'wins',    label: 'GROWTH',   Icon: Trophy,      color: '#f5c435' },
  ] as const

  return (
    <div style={{ background: '#080810', minHeight: '100dvh' }}>

      {/* ── PRIME ─────────────────────────────────────── */}
      {state.currentView === 'prime' && (
        <>
          {screen === 'morning' && (
            <MorningPrime
              onComplete={saveMorning}
              dayCount={dayCount}
              streak={state.streak}
              lastWin={lastWin}
              yesterdayHabitsPct={yesterdayHabitsPct}
            />
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
              onComplete={data => { saveEvening(data); setForceEvening(false) }}
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

      {/* ── ACTIONS ───────────────────────────────────── */}
      {state.currentView === 'actions' && (
        <ActionsScreen
          completedHabits={today?.habits ?? []}
          onToggle={saveHabits}
          requiredHabitIds={requiredHabitIds}
        />
      )}

      {/* ── INSPIRE ───────────────────────────────────── */}
      {state.currentView === 'inspire' && <InspireScreen />}

      {/* ── WINS / GROWTH ─────────────────────────────── */}
      {state.currentView === 'wins' && (
        <WinsWall entries={state.entries} streak={state.streak} totalDays={state.totalDays} />
      )}

      {/* ── Bottom navigation ─────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center z-30"
        style={{
          height: '64px',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map(({ id, label, Icon, color }) => {
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
                style={{ color: active ? color : '#4a4868' }}
              />
              <span
                className="text-[7px] tracking-[1.5px] font-bold uppercase"
                style={{ color: active ? color : '#4a4868' }}
              >
                {label}
              </span>
              {active && (
                <div
                  className="absolute bottom-0 w-7 h-0.5 rounded-t-full"
                  style={{ background: color }}
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
