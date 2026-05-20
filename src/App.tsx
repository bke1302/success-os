import { useState, useEffect, useRef } from 'react'
import { useAppData, getDayPhase } from './hooks/useAppData'
import { requestAndScheduleReminder } from './utils/reminder'
import { HABITS } from './constants'
import { getTodayRequiredHabitIds } from './data/program'
import { HomeScreen }           from './screens/HomeScreen'
import { MorningPrime }         from './screens/MorningPrime'
import { DayScreen }            from './screens/DayScreen'
import { EveningReview }        from './screens/EveningReview'
import { ActionsScreen }        from './screens/ActionsScreen'
import { TasksScreen }          from './screens/TasksScreen'
import { WinsWall }             from './screens/WinsWall'
import { FearFuelScreen }       from './screens/FearFuelScreen'
import { WeeklyWarRoom }        from './screens/WeeklyWarRoom'
import { BottomNav }            from './components/BottomNav'
import { BurnTheBoats }         from './components/BurnTheBoats'
import { EnergyCheckinOverlay } from './components/EnergyCheckinOverlay'
import { OnboardingScreen }     from './screens/OnboardingScreen'
import { ProfileScreen }         from './screens/ProfileScreen'
import { SplashScreen }          from './screens/SplashScreen'
import { CompletionScreen }      from './screens/CompletionScreen'
import { FocusScreen }           from './screens/FocusScreen'
import { MilestoneScreen }       from './screens/MilestoneScreen'
import { HabitChallengeScreen }  from './screens/HabitChallengeScreen'
import type { EnergyCheckin, AppState }   from './types'
import { ThemeContext }          from './contexts/ThemeContext'
import { darkTokens, lightTokens } from './theme'
import { useMilestone }          from './hooks/useMilestone'
import { useInstallPrompt }      from './hooks/useInstallPrompt'

export default function App() {
  const {
    state, today,
    saveMorning, saveEvening, saveHabits, saveEnergyCheckin,
    saveBurnTheBoats, clearBurnTheBoats,
    saveFearEntry, deleteFearEntry,
    saveWeeklyPlan, saveIncantation,
    setView, setUserName, saveUserGoals,
    saveTask, deleteTask, toggleTask,
    saveRedemption,
    saveHabitChallenge, clearHabitChallenge,
  } = useAppData()

  const [theme,           setTheme]           = useState<'dark'|'light'>(() => (localStorage.getItem('app_theme') as 'dark'|'light') ?? 'dark')
  const [showSplash,      setShowSplash]      = useState(true)
  const [forceEvening,    setForceEvening]    = useState(false)
  const [checkinPrompt,   setCheckinPrompt]   = useState<EnergyCheckin['label'] | null>(null)
  const [showCompletion,  setShowCompletion]  = useState(false)
  const [completionScore, setCompletionScore] = useState(0)

  const { showMilestone, dismissMilestone }   = useMilestone(state.streak)
  const { showInstallBanner, triggerInstall, dismissInstall } = useInstallPrompt()

  // Schedule notification on app load if already granted
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      requestAndScheduleReminder()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('app_theme', next)
  }
  const splashRef = useRef(false)
  if (!splashRef.current) {
    splashRef.current = true
    setTimeout(() => setShowSplash(false), 1500)
  }

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
  const canGoBack = !['home', 'prime', 'wins', 'tasks', 'profile'].includes(state.currentView)

  if (showSplash) return <SplashScreen />

  // Show onboarding for new users
  if (!state.userName) {
    return <OnboardingScreen onComplete={name => setUserName(name)} />
  }

  const tokens = theme === 'dark' ? darkTokens : lightTokens

  return (
    <ThemeContext.Provider value={tokens}>
    <div data-theme={theme} style={{ background: tokens.bg, height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>

      {/* Partner banner */}
      {partnerData && (
        <div style={{ flexShrink: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(255,214,10,.07)', borderBottom: '1px solid rgba(255,214,10,.2)' }}>
          
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,214,10,.85)' }} dir="rtl">
            השותף שלך: {partnerData.streak} STREAK · {partnerData.totalDays} ימים · ממוצע {partnerData.avgScore}
          </p>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div style={{ flexShrink: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'rgba(91,140,255,.08)', borderBottom: `1px solid ${tokens.border}` }}>
          <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: tokens.textSub, margin: 0 }}>הוסף לדף הבית לחוויה מלאה</p>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={triggerInstall} style={{ padding: '5px 12px', background: '#5B8CFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff' }}>
              הוסף
            </button>
            <button onClick={dismissInstall}
              style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${tokens.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.textMuted }}>
              לא עכשיו
            </button>
          </div>
        </div>
      )}

      {/* Completion overlay */}
      {showCompletion && (
        <CompletionScreen
          score={completionScore}
          onDone={() => { setShowCompletion(false); setView('home') }}
        />
      )}

      {/* Milestone overlay */}
      {showMilestone && (
        <MilestoneScreen
          streak={state.streak}
          onDone={dismissMilestone}
        />
      )}

      {/* Energy overlay */}
      {checkinPrompt && (
        <EnergyCheckinOverlay
          label={checkinPrompt}
          onSave={c => { saveEnergyCheckin(c); setCheckinPrompt(null) }}
          onClose={() => setCheckinPrompt(null)}
        />
      )}

      {/* Bottom nav — always visible */}
      <BottomNav current={state.currentView} onChange={v => { setView(v); setForceEvening(false) }} />

      {/* Back bar — shown on prime + sub-views */}
      {canGoBack && (
        <div style={{
          flexShrink: 0,
          background: tokens.bg,
          borderBottom: `1px solid ${tokens.border}`,
          transition: 'background .3s',
        }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <button
            onClick={() => { setView('home'); setForceEvening(false) }}
            aria-label="חזור לדף הבית"
            style={{
              background: 'transparent',
              border: `1px solid ${tokens.border}`,
              borderRadius: 9, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: tokens.textMuted,
              fontSize: 13, fontWeight: 700,
            }}>
            ←
          </button>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '2px',
            color: tokens.textMuted, textTransform: 'uppercase',
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            {state.currentView === 'prime' && 'פריים'}
            {state.currentView === 'actions' && 'פעולות'}
            {state.currentView === 'focus'   && 'פוקוס'}
            {state.currentView === 'tasks'   && 'משימות'}
            {state.currentView === 'wins' && 'גדילה'}
            {state.currentView === 'fear' && 'פחד'}
            {state.currentView === 'weekly' && 'חדר מלחמה'}
            {state.currentView === 'profile'   && 'פרופיל'}
            {state.currentView === 'challenge'  && 'אתגר הרגל'}
          </span>
        </div>
        </div>
      )}

      {/* Content */}
      <div key={state.currentView} className="screen-in" style={{ flex: 1, overflow: 'hidden' }}>

        {state.currentView === 'home' && (
          <HomeScreen
            dayCount={dayCount}
            streak={state.streak}
            today={today}
            userName={state.userName ?? ''}
            entries={state.entries}
            tasks={state.tasks ?? []}
            challenge={state.habitChallenge}
            onStart={() => setView('prime')}
            onNavigate={(v) => { setView(v as AppState['currentView']); setForceEvening(false) }}
            onRedemption={saveRedemption}
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
                userGoals={state.userGoals ?? []}
                entries={state.entries}
                onGoToProfile={() => setView('profile')}
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
                onComplete={data => {
                  saveEvening(data)
                  setForceEvening(false)
                  setCompletionScore(data.score)
                  setShowCompletion(true)
                }}
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

        {state.currentView === 'focus'   && <FocusScreen />}

        {state.currentView === 'tasks' && (
          <TasksScreen
            tasks={state.tasks ?? []}
            onSave={saveTask}
            onDelete={deleteTask}
            onToggle={toggleTask}
          />
        )}

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

        {state.currentView === 'challenge' && (
          <HabitChallengeScreen
            challenge={state.habitChallenge}
            entries={state.entries}
            onSave={saveHabitChallenge}
            onClear={clearHabitChallenge}
          />
        )}

        {state.currentView === 'profile' && (
          <ProfileScreen
            userName={state.userName ?? ''}
            goals={state.userGoals ?? []}
            onSaveGoals={saveUserGoals}
            theme={theme}
            onToggleTheme={toggleTheme}
            appData={state}
            onImportData={data => {
              try {
                const imported = data as AppState
                localStorage.setItem('prime_v1', JSON.stringify(imported))
                window.location.reload()
              } catch { /* ignore */ }
            }}
          />
        )}
      </div>

      {/* Bottom nav spacer — prevents content from hiding behind fixed nav */}
      <div style={{ flexShrink: 0, height: 68 }} />

      {/* Burn the Boats */}
      {state.currentView === 'prime' && screen === 'day' && (
        <div style={{ position: 'fixed', bottom: 88, left: 16, right: 16, zIndex: 20 }}>
          <BurnTheBoats
            current={state.burnTheBoats}
            onSave={saveBurnTheBoats}
            onClear={clearBurnTheBoats}
          />
        </div>
      )}
    </div>
    </ThemeContext.Provider>
  )
}
