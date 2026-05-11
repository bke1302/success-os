import { useState, useEffect, useRef } from 'react'
import { History, Settings, LayoutDashboard, Zap } from 'lucide-react'
import { ChecklistCard }           from './components/ChecklistCard'
import { AICoach }                 from './components/AICoach'
import { HistoryTab }              from './components/HistoryTab'
import { SettingsTab }             from './components/SettingsTab'
import { ScorePanel, ScoreBanner } from './components/ScorePanel'
import { Confetti }                from './components/Confetti'
import { WarMode }                 from './components/WarMode'
import { AchievementToast }        from './components/AchievementToast'
import { useLocalStorage }         from './hooks/useLocalStorage'
import { useAI }                   from './hooks/useAI'
import { useNotifications }        from './hooks/useNotifications'
import { useAchievements }         from './hooks/useAchievements'
import { playCheck, playUncheck, playComplete } from './utils/sounds'
import { QUOTES }                  from './constants'
import type { DayLog, TabId }      from './types'

const TOTAL_CHECKS = 5

function todayStr() {
  return new Date().toLocaleDateString('he-IL')
}

// Returns how many calendar days apart two he-IL date strings are
function daysBetween(a: string, b: string): number {
  const parse = (s: string) => {
    const [d, m, y] = s.split('.').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  return Math.round(Math.abs(parse(a) - parse(b)) / 86_400_000)
}

export default function App() {
  const [tab, setTab] = useState<TabId>('today')

  const [checks,        setChecks]        = useLocalStorage<Record<string, boolean>>('ss_checks',    {})
  const [journal,       setJournal]       = useLocalStorage<string>  ('ss_journal',    '')
  const [mainTask,      setMainTask]      = useLocalStorage<string>  ('ss_maintask',   '')
  const [mainTaskDone,  setMainTaskDone]  = useLocalStorage<boolean> ('ss_maintaskdone', false)
  const [apiKey,        setApiKey]        = useLocalStorage<string>  ('ss_apikey',     '')
  const [streak,        setStreak]        = useLocalStorage<number>  ('ss_streak',     0)
  const [dayCount,      setDayCount]      = useLocalStorage<number>  ('ss_day',        1)
  const [history,       setHistory]       = useLocalStorage<DayLog[]>('ss_history',    [])
  const [lastDate,      setLastDate]      = useLocalStorage<string>  ('ss_lastdate',   '')
  const [customLabels,  setCustomLabels]  = useLocalStorage<string[]>('ss_labels',     [])

  const { response, loading, error, analyze, clear } = useAI()
  const { enabled: notifsEnabled, toggleNotifications, reminderTime, setReminderTime } = useNotifications()

  const [warMode,  setWarMode]  = useState(false)
  const [confetti, setConfetti] = useState(false)

  const [quoteIndex,   setQuoteIndex]   = useState(() => new Date().getDay() % QUOTES.length)
  const [quoteVisible, setQuoteVisible] = useState(true)

  // ── Auto new-day detection ──────────────────────────────────────────────
  useEffect(() => {
    const today = todayStr()
    if (lastDate && lastDate !== today) {
      // A new calendar day started — auto-save yesterday and reset
      const prevDone  = Object.values(checks).filter(Boolean).length
      const prevScore = Math.round((prevDone / TOTAL_CHECKS) * 100)

      if (journal || prevDone > 0) {
        setHistory(p => [
          ...p,
          {
            date:         lastDate,
            score:        prevScore,
            journal,
            mainTask,
            mainTaskDone,
            checks:       { ...checks },
            aiResponse:   response,
          },
        ])
      }

      setChecks({})
      setJournal('')
      setMainTask('')
      setMainTaskDone(false)
      clear()
      setDayCount(d => d + 1)

      // Streak: if the gap is exactly 1 day and previous day was good (≥3), continue
      const gap = daysBetween(lastDate, today)
      setStreak(gap === 1 && prevDone >= 3 ? Math.min(streak + 1, 365) : (prevDone >= 3 ? 1 : 0))
    }
    setLastDate(today)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // On mount only — captures fresh localStorage values

  // ── Rotating quotes ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 500)
    }, 3 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const done  = Object.values(checks).filter(Boolean).length
  // +20 bonus if primary objective is marked done (capped at 100)
  const score = Math.min(100, Math.round((done / TOTAL_CHECKS) * 100) + (mainTaskDone ? 20 : 0))

  const { toast: achToast, allAchievements, dismissToast } = useAchievements(history, streak, done, mainTaskDone, dayCount)
  const prevDoneRef = useRef(done)

  // ── Confetti + sound when all tasks complete ──────────────────────────
  useEffect(() => {
    if (done === TOTAL_CHECKS && prevDoneRef.current < TOTAL_CHECKS) {
      playComplete()
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4000)
    }
    prevDoneRef.current = done
  }, [done])

  const handleToggle = (id: string) => {
    const wasChecked = checks[id] ?? false
    wasChecked ? playUncheck() : playCheck()
    setChecks((p) => ({ ...p, [id]: !p[id] }))
  }
  const handleAnalyze = () => void analyze(journal, score, done, apiKey, streak, mainTaskDone)

  const handleResetDay = () => {
    if (journal || done > 0) {
      setHistory((p) => [
        ...p,
        {
          date:         todayStr(),
          score,
          journal,
          mainTask,
          mainTaskDone,
          checks:       { ...checks },
          aiResponse:   response,
        },
      ])
    }
    setChecks({})
    setJournal('')
    setMainTask('')
    setMainTaskDone(false)
    clear()
    setDayCount((d) => d + 1)
    setStreak(done >= 3 ? Math.min(streak + 1, 365) : 0)
    setLastDate(todayStr())
  }

  const tabs: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
    { id: 'today',    label: 'TODAY',    Icon: LayoutDashboard },
    { id: 'history',  label: 'HISTORY',  Icon: History         },
    { id: 'settings', label: 'SETTINGS', Icon: Settings        },
  ]

  /* shared today content */
  const todayContent = (
    <div className="px-4 md:px-8 py-5 md:py-7 flex flex-col gap-4 md:gap-5 md:max-w-2xl">
      <ChecklistCard checks={checks} onToggle={handleToggle} customLabels={customLabels} />

      {/* Mission */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: mainTaskDone ? 'rgba(232,160,32,0.05)' : 'rgba(255,255,255,0.03)',
          border: mainTaskDone ? '1px solid rgba(232,160,32,0.25)' : '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.4s ease',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.6), transparent)' }}
        />
        <div className="flex items-center justify-between mb-3">
          <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">PRIMARY OBJECTIVE</p>
          {mainTask.trim() && (
            <button
              onClick={() => setMainTaskDone(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] tracking-[2px] uppercase font-bold transition-all duration-300"
              style={
                mainTaskDone
                  ? { background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.4)', color: '#f5c435' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a4868' }
              }
            >
              {mainTaskDone ? '✓ עשיתי!' : 'סמן כבוצע'}
            </button>
          )}
        </div>
        <textarea
          value={mainTask}
          onChange={(e) => setMainTask(e.target.value)}
          placeholder="המשימה האחת שאם תעשה אותה — היום הוא הצלחה"
          className="w-full rounded-xl p-4 text-sm font-medium resize-none outline-none transition-all placeholder:text-muted leading-relaxed"
          style={{
            height: '88px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: mainTaskDone ? 'rgba(245,196,53,0.6)' : 'white',
            textDecoration: mainTaskDone ? 'line-through' : 'none',
          }}
          dir="rtl"
        />
        {mainTaskDone && (
          <p className="text-[9px] tracking-[2px] uppercase font-bold mt-2 text-center" style={{ color: '#f5c435' }}>
            +20 BONUS POINTS
          </p>
        )}
      </div>

      <AICoach
        journal={journal}
        onJournalChange={setJournal}
        onAnalyze={handleAnalyze}
        loading={loading}
        response={response}
        error={error}
        hasApiKey={!!apiKey}
      />
    </div>
  )

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse at 20% 60%, #110e2a 0%, #080612 50%, #07070e 100%)',
      }}
    >
      {/* Global overlays */}
      <Confetti active={confetti} />
      <AchievementToast achievement={achToast} onDismiss={dismissToast} />
      {warMode && (
        <WarMode
          checks={checks}
          onToggle={handleToggle}
          onClose={() => setWarMode(false)}
          customLabels={customLabels}
          score={score}
          done={done}
          total={TOTAL_CHECKS}
        />
      )}

      {/* ══════════════════════════════════════════════
          DESKTOP: top nav bar
      ══════════════════════════════════════════════ */}
      <header
        className="hidden md:flex shrink-0 items-center justify-between px-8 h-14 z-20"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,7,14,0.7)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="font-display text-2xl tracking-[6px]"
            style={{ background: 'linear-gradient(135deg, #f5c435, #e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            APEX
          </div>
          <div className="w-px h-4 bg-white/10" />
          <p className="text-[8px] tracking-[3px] uppercase font-medium text-muted">SUCCESS OS</p>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] tracking-[3px] font-bold uppercase transition-all duration-150"
              style={
                tab === id
                  ? { background: 'rgba(232,160,32,0.12)', border: '1px solid rgba(232,160,32,0.35)', color: '#f5c435' }
                  : { background: 'transparent', border: '1px solid transparent', color: '#4a4868' }
              }
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={tab === id ? 2 : 1.5} />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] tracking-[3px] uppercase font-bold text-muted">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p
              className="text-[9px] italic text-sub mt-0.5 max-w-[180px] truncate transition-opacity duration-500"
              style={{ opacity: quoteVisible ? 0.7 : 0 }}
            >
              {QUOTES[quoteIndex]}
            </p>
          </div>
          <button
            onClick={() => setWarMode(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[8px] tracking-[3px] uppercase font-bold transition-all"
            style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.25)', color: '#e8a020' }}
            title="War Mode — מצב פוקוס מלא"
          >
            <Zap className="w-3 h-3" strokeWidth={2} />
            WAR
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE: compact top bar
      ══════════════════════════════════════════════ */}
      <header
        className="md:hidden flex items-center justify-between px-5 h-12 shrink-0 z-20"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div
          className="font-display text-xl tracking-[5px]"
          style={{ background: 'linear-gradient(135deg, #f5c435, #e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          APEX
        </div>
        <p
          className="text-[9px] italic text-sub transition-opacity duration-500 max-w-[180px] truncate"
          style={{ opacity: quoteVisible ? 0.65 : 0 }}
        >
          {QUOTES[quoteIndex]}
        </p>
        <p className="text-[8px] tracking-[2px] font-bold text-muted">
          {new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}
        </p>
      </header>

      {/* ══════════════════════════════════════════════
          DESKTOP body: split screen
      ══════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - 56px)' }}>

        {tab === 'today' && (
          <>
            <div className="w-72 shrink-0 h-full">
              <ScorePanel
                score={score} done={done} total={TOTAL_CHECKS}
                streak={streak} dayCount={dayCount} onResetDay={handleResetDay}
              />
            </div>
            <div className="flex-1 overflow-y-auto">{todayContent}</div>
          </>
        )}

        {tab === 'history' && (
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <h2
              className="font-display text-4xl tracking-[6px] mb-8"
              style={{ background: 'linear-gradient(135deg, #f5c435, #e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              HISTORY
            </h2>
            <HistoryTab history={history} allAchievements={allAchievements} customLabels={customLabels} />
          </div>
        )}

        {tab === 'settings' && (
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <h2
              className="font-display text-4xl tracking-[6px] mb-8"
              style={{ background: 'linear-gradient(135deg, #f5c435, #e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              SETTINGS
            </h2>
            <SettingsTab
              apiKey={apiKey} onApiKeyChange={setApiKey}
              onResetDay={handleResetDay} onClearHistory={() => setHistory([])}
              notificationsEnabled={notifsEnabled}
              onToggleNotifications={toggleNotifications}
              reminderTime={reminderTime}
              onReminderTimeChange={setReminderTime}
              customLabels={customLabels}
              onCustomLabelsChange={setCustomLabels}
            />
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════
          MOBILE body
      ══════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col flex-1" style={{ paddingBottom: '64px' }}>

        {tab === 'today' && (
          <ScoreBanner
            score={score} done={done} total={TOTAL_CHECKS}
            streak={streak} dayCount={dayCount} onResetDay={handleResetDay}
          />
        )}

        {tab !== 'today' && (
          <div className="px-5 pt-5 pb-3">
            <h2
              className="font-display text-3xl tracking-[5px]"
              style={{ background: 'linear-gradient(135deg, #f5c435, #e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {tab === 'history' ? 'HISTORY' : 'SETTINGS'}
            </h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {tab === 'today'    && todayContent}
          {tab === 'history'  && <div className="px-4 py-2 pb-6"><HistoryTab history={history} /></div>}
          {tab === 'settings' && (
            <div className="px-4 py-2 pb-6">
              <SettingsTab
                apiKey={apiKey} onApiKeyChange={setApiKey}
                onResetDay={handleResetDay} onClearHistory={() => setHistory([])}
                notificationsEnabled={notifsEnabled}
                onToggleNotifications={toggleNotifications}
                reminderTime={reminderTime}
                onReminderTimeChange={setReminderTime}
                customLabels={customLabels}
                onCustomLabelsChange={setCustomLabels}
              />
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          MOBILE: fixed bottom navigation
      ══════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center z-30"
        style={{
          height: '64px',
          background: 'rgba(7,7,14,0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-150 relative"
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={tab === id ? 2 : 1.5}
              style={{ color: tab === id ? '#f5c435' : '#4a4868' }}
            />
            <span
              className="text-[8px] tracking-[2px] font-bold uppercase"
              style={{ color: tab === id ? '#f5c435' : '#4a4868' }}
            >
              {label}
            </span>
            {tab === id && (
              <div
                className="absolute bottom-0 w-8 h-0.5 rounded-t-full"
                style={{ background: 'linear-gradient(90deg, #e8a020, #f5c435)' }}
              />
            )}
          </button>
        ))}
      </nav>

    </div>
  )
}
