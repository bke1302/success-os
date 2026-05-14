import { useState, useEffect } from 'react'
import { useAppData, getDayPhase } from './hooks/useAppData'
import { HABITS } from './constants'
import { getTodayRequiredHabitIds } from './data/program'
import { HomeScreen }           from './screens/HomeScreen'
import { MorningPrime }         from './screens/MorningPrime'
import { DayScreen }            from './screens/DayScreen'
import { EveningReview }        from './screens/EveningReview'
import { ActionsScreen }        from './screens/ActionsScreen'
import { InspireScreen }        from './screens/InspireScreen'
import { WinsWall }             from './screens/WinsWall'
import { FearFuelScreen }       from './screens/FearFuelScreen'
import { WeeklyWarRoom }        from './screens/WeeklyWarRoom'
import { MenuDrawer }           from './components/MenuDrawer'
import { BurnTheBoats }         from './components/BurnTheBoats'
import { EnergyCheckinOverlay } from './components/EnergyCheckinOverlay'
import type { EnergyCheckin }   from './types'

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

  const [menuOpen,      setMenuOpen]      = useState(false)
  const [forceEvening,  setForceEvening]  = useState(false)
  const [checkinPrompt, setCheckinPrompt] = useState<EnergyCheckin['label'] | null>(null)

  const phase    = getDayPhase()
  const dayCount = state.entries.length + 1

  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()
  const yesterdayEntry     = state.entries.find(e => e.date === yesterday)
  const lastWin            = yesterdayEntry?.evening?.given ?? yesterdayEntry?.evening?.win
  const yesterdayHabitsPct = yesterdayEntry?.habits
    ? yesterdayEntry.habits.length / HABITS.length : 0

  const requiredHabitIds = getTodayRequiredHabitIds(dayCount)

  useEffect(() => {
    if (!('Notification' in window)) return
    const schedule = (label: EnergyCheckin['label'], hour: number, minute: number) => {
      const now  = new Date()
      const fire = new Date()
      fire.setHours(hour, minute, 0, 0)
      if (fire <= now) return
      const delay = fire.getTime() - now.getTime()
      const tid = window.setTimeout(() => {
        const todayCheckins = state.entries
          .find(e => e.date === new Date().toISOString().slice(0, 10))
          ?.energyCheckins ?? []
        if (!todayCheckins.find(c => c.label === label)) setCheckinPrompt(label)
      }, delay)
      return tid
    }
    const ids = [schedule('midday', 12, 0), schedule('afternoon', 16, 0)].filter(Boolean)
    return () => ids.forEach(id => clearTimeout(id!))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleNavigate = (v: typeof state.currentView) => {
    setMenuOpen(false)
    setView(v)
  }

  const isSubView = state.currentView !== 'home' && state.currentView !== 'prime'

  return (
    <div style={{ background: '#080810', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Partner banner */}
      {partnerData && (
        <div className="shrink-0 px-4 py-2 flex items-center justify-center gap-3" style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.25)' }}>
          <span className="text-sm">👥</span>
          <p className="text-xs font-bold" style={{ color: 'rgba(167,170,255,0.9)' }} dir="rtl">
            השותף שלך: {partnerData.streak} 🔥 streak · {partnerData.totalDays} ימים · ממוצע {partnerData.avgScore}
          </p>
        </div>
      )}

      {/* Energy check-in overlay */}
      {checkinPrompt && (
        <EnergyCheckinOverlay
          label={checkinPrompt}
          onSave={c => { saveEnergyCheckin(c); setCheckinPrompt(null) }}
          onClose={() => setCheckinPrompt(null)}
        />
      )}

      {/* Menu drawer */}
      {menuOpen && (
        <MenuDrawer
          currentView={state.currentView}
          onNavigate={handleNavigate}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/* Screens */}
      <div className="flex-1 overflow-hidden">

        {/* HOME */}
        {state.currentView === 'home' && (
          <HomeScreen
            dayCount={dayCount}
            streak={state.streak}
            today={today}
            onStart={() => setView('prime')}
            onOpenMenu={() => setMenuOpen(true)}
          />
        )}

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
                onComplete={data => { saveEvening(data); setForceEvening(false); setView('home') }}
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

        {/* SUB-VIEWS with back header */}
        {isSubView && (
          <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="shrink-0 flex items-center gap-3"
              style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a3d', background: '#0a0a0f' }}>
              <button
                onClick={() => setView('home')}
                style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b8a', fontSize: 18 }}>
                ←
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', color: '#6b6b8a', fontSize: 10, fontWeight: 700, letterSpacing: '2px' }}>
                MENU
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {state.currentView === 'actions' && (
                <ActionsScreen
                  completedHabits={today?.habits ?? []}
                  onToggle={saveHabits}
                  requiredHabitIds={requiredHabitIds}
                />
              )}
              {state.currentView === 'inspire' && <InspireScreen />}
              {state.currentView === 'wins' && (
                <WinsWall entries={state.entries} streak={state.streak} totalDays={state.totalDays} />
              )}
              {state.currentView === 'fear' && (
                <FearFuelScreen
                  entries={state.fearEntries ?? []}
                  onSave={saveFearEntry}
                  onDelete={deleteFearEntry}
                />
              )}
              {state.currentView === 'weekly' && (
                <WeeklyWarRoom
                  entries={state.entries}
                  plans={state.weeklyPlans ?? []}
                  onSave={saveWeeklyPlan}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Burn the Boats floating */}
      {state.currentView === 'prime' && screen === 'day' && (
        <div style={{ position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 20 }}>
          <BurnTheBoats
            current={state.burnTheBoats}
            onSave={saveBurnTheBoats}
            onClear={clearBurnTheBoats}
          />
        </div>
      )}
    </div>
  )
}
