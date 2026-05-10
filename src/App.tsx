import { useState, useEffect } from 'react'
import { History, Settings, LayoutDashboard } from 'lucide-react'
import { ChecklistCard }      from './components/ChecklistCard'
import { AICoach }            from './components/AICoach'
import { HistoryTab }         from './components/HistoryTab'
import { SettingsTab }        from './components/SettingsTab'
import { ScorePanel, ScoreBanner } from './components/ScorePanel'
import { useLocalStorage }    from './hooks/useLocalStorage'
import { useAI }              from './hooks/useAI'
import { useNotifications }   from './hooks/useNotifications'
import { QUOTES }             from './constants'
import type { DayLog, TabId } from './types'

const TOTAL_CHECKS = 5

export default function App() {
  const [tab, setTab] = useState<TabId>('today')

  const [checks,   setChecks]   = useLocalStorage<Record<string, boolean>>('ss_checks',  {})
  const [journal,  setJournal]  = useLocalStorage<string>  ('ss_journal',  '')
  const [mainTask, setMainTask] = useLocalStorage<string>  ('ss_maintask', '')
  const [apiKey,   setApiKey]   = useLocalStorage<string>  ('ss_apikey',   '')
  const [streak,   setStreak]   = useLocalStorage<number>  ('ss_streak',   3)
  const [dayCount, setDayCount] = useLocalStorage<number>  ('ss_day',      1)
  const [history,  setHistory]  = useLocalStorage<DayLog[]>('ss_history',  [])

  const { response, loading, error, analyze, clear } = useAI()
  const { enabled: notifsEnabled, toggleNotifications } = useNotifications()

  const [quoteIndex,   setQuoteIndex]   = useState(() => new Date().getDay() % QUOTES.length)
  const [quoteVisible, setQuoteVisible] = useState(true)

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
  const score = Math.round((done / TOTAL_CHECKS) * 100)

  const handleToggle  = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }))
  const handleAnalyze = () => void analyze(journal, score, done, apiKey)

  const handleResetDay = () => {
    if (journal || done > 0) {
      setHistory((p) => [
        ...p,
        {
          date:       new Date().toLocaleDateString('he-IL'),
          score,
          journal,
          mainTask,
          checks:     { ...checks },
          aiResponse: response,
        },
      ])
    }
    setChecks({})
    setJournal('')
    setMainTask('')
    clear()
    setDayCount((d) => d + 1)
    setStreak(done >= 3 ? Math.min(streak + 1, 7) : 1)
  }

  const tabs: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
    { id: 'today',    label: 'TODAY',    Icon: LayoutDashboard },
    { id: 'history',  label: 'HISTORY',  Icon: History         },
    { id: 'settings', label: 'SETTINGS', Icon: Settings        },
  ]

  /* shared today content (used by both mobile & desktop) */
  const todayContent = (
    <div className="px-4 md:px-8 py-5 md:py-7 flex flex-col gap-4 md:gap-5 md:max-w-2xl">
      <ChecklistCard checks={checks} onToggle={handleToggle} />

      {/* Mission */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.6), transparent)' }}
        />
        <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted mb-3">PRIMARY OBJECTIVE</p>
        <textarea
          value={mainTask}
          onChange={(e) => setMainTask(e.target.value)}
          placeholder="המשימה האחת שאם תעשה אותה — היום הוא הצלחה"
          className="w-full rounded-xl p-4 text-sm text-white font-medium resize-none outline-none transition-all placeholder:text-muted leading-relaxed"
          style={{ height: '88px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          dir="rtl"
        />
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

      {/* ══════════════════════════════════════════════
          DESKTOP: top nav bar (hidden on mobile)
      ══════════════════════════════════════════════ */}
      <header
        className="hidden md:flex shrink-0 items-center justify-between px-8 h-14 z-20"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,7,14,0.7)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
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

        {/* Tabs */}
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

        {/* Date + quote */}
        <div className="text-right">
          <p className="text-[8px] tracking-[3px] uppercase font-bold text-muted">
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p
            className="text-[9px] italic text-sub mt-0.5 max-w-[220px] truncate transition-opacity duration-500"
            style={{ opacity: quoteVisible ? 0.7 : 0 }}
          >
            {QUOTES[quoteIndex]}
          </p>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE: compact top bar (hidden on desktop)
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
          DESKTOP body: split screen (hidden on mobile)
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
            <HistoryTab history={history} />
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
            />
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════
          MOBILE body: vertical stack (hidden on desktop)
      ══════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col flex-1" style={{ paddingBottom: '64px' }}>

        {/* Score banner — only on today tab */}
        {tab === 'today' && (
          <ScoreBanner
            score={score} done={done} total={TOTAL_CHECKS}
            streak={streak} dayCount={dayCount} onResetDay={handleResetDay}
          />
        )}

        {/* Page title for history/settings */}
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

        {/* Scrollable content */}
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
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-150"
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
