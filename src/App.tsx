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
import { RightNav }             from './components/RightNav'
import { BurnTheBoats }         from './components/BurnTheBoats'
import { EnergyCheckinOverlay } from './components/EnergyCheckinOverlay'
import type { EnergyCheckin }   from './types'

const NAV_W = 62

export default function App() {
  const {
    state, today,
    saveMorning, saveEvening, saveHabits, saveEnergyCheckin,
    saveBurnTheBoats, clearBurnTheBoats,
    saveFearEntry, deleteFearEntry,
    saveWeeklyPlan, saveIncantation,
    setView,
  } = useAppData()

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
      const now = new Date(), fire = new Date()
      fire.setHours(hour, minute, 0, 0)
      if (fire <= now) return
      const tid = window.setTimeout(() => {
        const todayCheckins = state.entries
          .find(e => e.date === new Date().toISOString().slice(0, 10))
          ?.energyCheckins ?? []
        if (!todayCheckins.find(c => c.label === label)) setCheckinPrompt(label)
      }, fire.getTime() - now.getTime())
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

  // Back button: prime/sub-views go back to home
  const canGoBack = state.currentView !== 'home'

  return (
    <div style={{ background: '#000', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Partner banner */}
      {partnerData && (
        <div style={{ flexShrink: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(10,132,255,.1)', borderBottom: '1px solid rgba(10,132,255,.2)', marginRight: NAV_W }}>
          <span>👥</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(167,170,255,.9)' }} dir="rtl">
            השותף שלך: {partnerData.streak} 🔥 · {partnerData.totalDays} ימים · ממוצע {partnerData.avgScore}
          </p>
        </div>
      )}

      {/* Energy overlay */}
      {checkinPrompt && (
        <EnergyCheckinOverlay
          label={checkinPrompt}
          onSave={c => { saveEnergyCheckin(c); setCheckinPrompt(null) }}
          onClose={() => setCheckinPrompt(null)}
        />
      )}

      {/* Right nav — always visible */}
      <RightNav current={state.currentView} onChange={v => { setView(v); setForceEvening(false) }} />

      {/* Back bar — shown on prime + sub-views */}
      {canGoBack && (
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px',
          background: 'rgba(8,8,8,.97)',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          marginRight: NAV_W,
        }}>
          <button
            onClick={() => { setView('home'); setForceEvening(false) }}
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,.58)',
              fontSize: 16, fontWeight: 700,
            }}>
            ←
          </button>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '1.5px',
            color: 'rgba(255,255,255,.3)', textTransform: 'uppercase',
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            {state.currentView === 'prime' && 'PRIME'}
            {state.currentView === 'actions' && 'ACTIONS'}
            {state.currentView === 'inspire' && 'INSPIRE'}
            {state.currentView === 'wins' && 'GROWTH'}
            {state.currentView === 'fear' && 'FEAR'}
            {state.currentView === 'weekly' && 'WAR ROOM'}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', marginRight: NAV_W }}>

        {state.currentView === 'home' && (
          <HomeScreen
            dayCount={dayCount}
            streak={state.streak}
            today={today}
            onStart={() => setView('prime')}
          />
        )}

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

      {/* Burn the Boats */}
      {state.currentView === 'prime' && screen === 'day' && (
        <div style={{ position: 'fixed', bottom: 20, left: 16, right: NAV_W + 16, zIndex: 20 }}>
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
