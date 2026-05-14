import { useState, useEffect } from 'react'
import { Zap, CheckSquare, Play, Trophy, Skull, Swords } from 'lucide-react'
import { useAppData, getDayPhase } from './hooks/useAppData'
import { HABITS } from './constants'
import { getTodayRequiredHabitIds } from './data/program'
import { MorningPrime }     from './screens/MorningPrime'
import { DayScreen }        from './screens/DayScreen'
import { EveningReview }    from './screens/EveningReview'
import { ActionsScreen }    from './screens/ActionsScreen'
import { InspireScreen }    from './screens/InspireScreen'
import { WinsWall }         from './screens/WinsWall'
import { FearFuelScreen }   from './screens/FearFuelScreen'
import { WeeklyWarRoom }    from './screens/WeeklyWarRoom'
import { BurnTheBoats }     from './components/BurnTheBoats'
import { EnergyCheckinOverlay } from './components/EnergyCheckinOverlay'
import type { EnergyCheckin } from './types'

export default function App() {
  const {
    state, today,
    saveMorning, saveEvening, saveHabits, saveEnergyCheckin,
    saveBurnTheBoats, clearBurnTheBoats,
    saveFearEntry, deleteFearEntry,
    saveWeeklyPlan,
    saveIncantation,
    setView,
  } = useAppData()

  const [forceEvening,    setForceEvening]    = useState(false)
  const [checkinPrompt,   setCheckinPrompt]   = useState<EnergyCheckin['label'] | null>(null)

  const phase    = getDayPhase()
  const dayCount = state.entries.length + 1

  // Yesterday
  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()
  const yesterdayEntry     = state.entries.find(e => e.date === yesterday)
  const lastWin            = yesterdayEntry?.evening?.given ?? yesterdayEntry?.evening?.win
  const yesterdayHabitsPct = yesterdayEntry?.habits
    ? yesterdayEntry.habits.length / HABITS.length : 0

  const requiredHabitIds = getTodayRequiredHabitIds(dayCount)

  // ── Energy check-in scheduler ───────────────────────────────────────
  useEffect(() => {
    if (!('Notification' in window)) return

    const schedule = (label: EnergyCheckin['label'], hour: number, minute: number) => {
      const now  = new Date()
      const fire = new Date()
      fire.setHours(hour, minute, 0, 0)
      if (fire <= now) return   // already past today

      const delay = fire.getTime() - now.getTime()
      const tid = window.setTimeout(() => {
        // Check if not already checked in for this label today
        const todayCheckins = state.entries
          .find(e => e.date === new Date().toISOString().slice(0, 10))
          ?.energyCheckins ?? []
        if (!todayCheckins.find(c => c.label === label)) {
          setCheckinPrompt(label)
        }
      }, delay)
      return tid
    }

    const ids = [
      schedule('midday',    12, 0),
      schedule('afternoon', 16, 0),
    ].filter(Boolean)

    return () => ids.forEach(id => clearTimeout(id!))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Check partner param ──────────────────────────────────────────────
  const partnerData = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('partner')
      if (!p) return null
      return JSON.parse(atob(p)) as { streak: number; totalDays: number; avgScore: string; date: string }
    } catch { return null }
  })()

  const primeScreen = (): 'morning' | 'day' | 'evening' | 'done' => {
    if (!today?.morning)                     return 'morning'
    if (today?.evening)                      return 'done'
    if (forceEvening || phase === 'evening') return 'evening'
    return 'day'
  }

  const screen = primeScreen()

  const NAV = [
    { id: 'prime',   label: 'PRIME',   Icon: Zap,         color: '#f5c435' },
    { id: 'actions', label: 'ACTIONS', Icon: CheckSquare, color: '#22c55e' },
    { id: 'inspire', label: 'INSPIRE', Icon: Play,        color: '#ef4444' },
    { id: 'wins',    label: 'GROWTH',  Icon: Trophy,      color: '#f5c435' },
    { id: 'fear',    label: 'FEAR',    Icon: Skull,       color: 'rgba(139,92,246,0.9)' },
    { id: 'weekly',  label: 'WAR',     Icon: Swords,      color: '#f97316' },
  ] as const

  return (
    <div style={{ background: '#080810', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Partner banner ──────────────────────────────────────────────── */}
      {partnerData && (
        <div className="shrink-0 px-4 py-2 flex items-center justify-center gap-3" style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.25)' }}>
          <span className="text-sm">👥</span>
          <p className="text-xs font-bold" style={{ color: 'rgba(167,170,255,0.9)' }} dir="rtl">
            השותף שלך: {partnerData.streak} 🔥 streak · {partnerData.totalDays} ימים · ממוצע {partnerData.avgScore}
          </p>
        </div>
      )}

      {/* ── Energy check-in overlay ─────────────────────────────────────── */}
      {checkinPrompt && (
        <EnergyCheckinOverlay
          label={checkinPrompt}
          onSave={c => { saveEnergyCheckin(c); setCheckinPrompt(null) }}
          onClose={() => setCheckinPrompt(null)}
        />
      )}

      {/* ── Screens ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '64px' }}>

        {/* PRIME */}
        {state.currentView === 'prime' && (
          <>
            {screen === 'morning' && (
              <MorningPrime
                onComplete={saveMorning}
                dayCount={dayCount}
                streak={state.streak}
                lastWin={lastWin}
                yesterdayHabitsPct={yesterdayHabitsPct}
                incantationB64={state.incantationB64}
                onSaveIncantation={saveIncantation}
              />
            )}
            {screen === 'day' && (
              <>
                <DayScreen
                  commitment={today!.morning!.commitment}
                  identity={today!.morning!.identity}
                  purpose={today!.morning!.purpose}
                  onFinishDay={() => setForceEvening(true)}
                  streak={state.streak}
                  dayCount={dayCount}
                />
              </>
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

        {/* ACTIONS */}
        {state.currentView === 'actions' && (
          <ActionsScreen
            completedHabits={today?.habits ?? []}
            onToggle={saveHabits}
            requiredHabitIds={requiredHabitIds}
          />
        )}

        {/* INSPIRE */}
        {state.currentView === 'inspire' && <InspireScreen />}

        {/* GROWTH / WINS */}
        {state.currentView === 'wins' && (
          <WinsWall entries={state.entries} streak={state.streak} totalDays={state.totalDays} />
        )}

        {/* FEAR → FUEL */}
        {state.currentView === 'fear' && (
          <FearFuelScreen
            entries={state.fearEntries ?? []}
            onSave={saveFearEntry}
            onDelete={deleteFearEntry}
          />
        )}

        {/* WEEKLY WAR ROOM */}
        {state.currentView === 'weekly' && (
          <WeeklyWarRoom
            entries={state.entries}
            plans={state.weeklyPlans ?? []}
            onSave={saveWeeklyPlan}
          />
        )}
      </div>

      {/* ── Burn the Boats — shown in DayScreen as floating element ───── */}
      {state.currentView === 'prime' && screen === 'day' && (
        <div style={{ position: 'fixed', bottom: '80px', left: 16, right: 16, zIndex: 20 }}>
          <BurnTheBoats
            current={state.burnTheBoats}
            onSave={saveBurnTheBoats}
            onClear={clearBurnTheBoats}
          />
        </div>
      )}

      {/* ── Bottom nav ──────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center z-30"
        style={{ height: '64px', background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #2a2a3d', paddingBottom: 'env(safe-area-inset-bottom)', padding: '0 8px' }}>
        {NAV.map(({ id, label, Icon, color }) => {
          const active = state.currentView === id
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150 relative"
              style={{ borderRadius: 10 }}
            >
              {active && (
                <div className="absolute inset-1" style={{ background: `${color}12`, borderRadius: 8 }} />
              )}
              <Icon className="w-4 h-4 relative" strokeWidth={active ? 2.5 : 1.5} style={{ color: active ? color : '#6b6b8a' }} />
              <span className="text-[6px] tracking-[1px] font-bold uppercase relative" style={{ color: active ? color : '#6b6b8a' }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
