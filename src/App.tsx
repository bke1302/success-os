import { useState, useEffect } from 'react'
import { LayoutDashboard, History, Settings, Target } from 'lucide-react'
import { ChecklistCard }   from './components/ChecklistCard'
import { ScoreCard }       from './components/ScoreCard'
import { AICoach }         from './components/AICoach'
import { HistoryTab }      from './components/HistoryTab'
import { SettingsTab }     from './components/SettingsTab'
import { ChartBackground } from './components/ChartBackground'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAI }           from './hooks/useAI'
import { QUOTES }          from './constants'
import type { DayLog, TabId } from './types'

const TOTAL_CHECKS = 5

export default function App() {
  const [tab,         setTab]         = useState<TabId>('today')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [checks,   setChecks]   = useLocalStorage<Record<string, boolean>>('ss_checks',  {})
  const [journal,  setJournal]  = useLocalStorage<string>  ('ss_journal',  '')
  const [mainTask, setMainTask] = useLocalStorage<string>  ('ss_maintask', '')
  const [apiKey,   setApiKey]   = useLocalStorage<string>  ('ss_apikey',   '')
  const [streak,   setStreak]   = useLocalStorage<number>  ('ss_streak',   3)
  const [dayCount, setDayCount] = useLocalStorage<number>  ('ss_day',      1)
  const [history,  setHistory]  = useLocalStorage<DayLog[]>('ss_history',  [])

  const { response, loading, error, analyze, clear } = useAI()

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
      setHistory((p) => [...p, {
        date: new Date().toLocaleDateString('he-IL'),
        score, journal, mainTask,
        checks: { ...checks },
        aiResponse: response,
      }])
    }
    setChecks({})
    setJournal('')
    setMainTask('')
    clear()
    setDayCount((d) => d + 1)
    setStreak(done >= 3 ? Math.min(streak + 1, 7) : 1)
  }

  const tabs: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
    { id: 'today',    label: 'Today',    Icon: LayoutDashboard },
    { id: 'history',  label: 'History',  Icon: History         },
    { id: 'settings', label: 'Settings', Icon: Settings        },
  ]

  return (
    <div className="min-h-screen bg-bg text-text flex" dir="rtl">

      {/* Gold chart background */}
      <ChartBackground />

      {/* ── Collapsible Sidebar (right side) ── */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`fixed right-0 top-0 h-screen bg-surface border-l border-border
                    flex flex-col z-20 transition-all duration-300 ease-in-out overflow-hidden
                    ${sidebarOpen ? 'w-52 shadow-2xl shadow-black/60' : 'w-14'}`}
      >
        {/* Gold accent edge */}
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-gold/40 via-gold/10 to-transparent" />

        {/* Logo */}
        <div className="px-4 py-5 border-b border-border shrink-0 overflow-hidden">
          {sidebarOpen ? (
            <div className="animate-fadeUp">
              <div
                className="font-display text-3xl tracking-widest leading-none"
                style={{
                  background: 'linear-gradient(135deg, #f5c842, #d4a43a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SUCCESS
              </div>
              <div
                className="font-display text-3xl tracking-widest leading-none"
                style={{
                  background: 'linear-gradient(135deg, #f5c842, #d4a43a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                OS
              </div>
              <p className="text-[8px] tracking-[4px] uppercase font-semibold text-muted mt-2">Performance</p>
            </div>
          ) : (
            <div
              className="font-display text-2xl tracking-widest text-center"
              style={{
                background: 'linear-gradient(135deg, #f5c842, #d4a43a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              S
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-150
                          ${sidebarOpen ? 'px-4 justify-start' : 'px-0 justify-center'}
                          ${tab === id
                            ? 'bg-gold/15 border border-gold/30 text-gold2'
                            : 'text-muted hover:text-text hover:bg-surface2 border border-transparent'
                          }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={tab === id ? 2 : 1.5} />
              {sidebarOpen && (
                <span className="text-xs font-semibold whitespace-nowrap animate-fadeUp">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quote in sidebar bottom */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border animate-fadeUp">
            <p
              className="text-[10px] leading-relaxed text-muted italic transition-opacity duration-500"
              style={{ opacity: quoteVisible ? 1 : 0 }}
            >
              {QUOTES[quoteIndex]}
            </p>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 mr-14 flex flex-col min-h-screen relative z-10">

        {/* Quote Banner */}
        <div className="relative overflow-hidden border-b border-border px-10 py-6 text-center">
          {/* Large quote watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            aria-hidden
          >
            <span
              className="font-display text-[200px] leading-none"
              style={{ color: '#f5c842', opacity: 0.03 }}
            >
              "
            </span>
          </div>

          {/* Gold glow blur under quote */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-16 blur-2xl rounded-full"
            style={{ background: 'radial-gradient(ellipse, #d4a43a, transparent)', opacity: 0.2 }}
          />

          {/* Date + MINDSET label */}
          <p className="text-[8px] tracking-[6px] uppercase font-semibold text-muted mb-4">
            {new Date().toLocaleDateString('he-IL', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' · '}
            MINDSET
          </p>

          {/* Quote text */}
          <p
            className="relative text-xl italic font-medium text-text max-w-2xl mx-auto leading-relaxed transition-opacity duration-500"
            style={{ opacity: quoteVisible ? 1 : 0 }}
          >
            {QUOTES[quoteIndex]}
          </p>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {QUOTES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:        i === quoteIndex ? '16px' : '4px',
                  height:       '4px',
                  background:   i === quoteIndex ? '#d4a43a' : 'transparent',
                  border:       i === quoteIndex ? 'none' : '1px solid #26263a',
                }}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 py-6">

          {/* TODAY TAB */}
          {tab === 'today' && (
            <div className="flex flex-col gap-4 max-w-5xl">

              {/* 1. ScoreCard full width */}
              <ScoreCard
                score={score}
                done={done}
                total={TOTAL_CHECKS}
                streak={streak}
                dayCount={dayCount}
              />

              {/* 2. Two-column grid */}
              <div className="grid grid-cols-2 gap-4">

                {/* Col 1 (right in RTL): ChecklistCard */}
                <ChecklistCard checks={checks} onToggle={handleToggle} />

                {/* Col 2 (left in RTL): Mission + AICoach + End Day */}
                <div className="flex flex-col gap-4">

                  {/* Mission card */}
                  <div className="bg-surface rounded-card p-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                      <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Primary Objective</p>
                    </div>
                    <textarea
                      value={mainTask}
                      onChange={(e) => setMainTask(e.target.value)}
                      placeholder="המשימה האחת שתגדיר את ההצלחה של היום"
                      className="w-full bg-surface2 rounded-xl p-4 text-base text-white font-medium resize-none h-28 outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-muted leading-relaxed border border-border"
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

                  {/* End Day button */}
                  <button
                    onClick={handleResetDay}
                    className="w-full py-3.5 rounded-xl bg-surface border border-border text-sub text-sm font-medium hover:text-text hover:bg-surface2 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <History className="w-4 h-4" strokeWidth={1.5} />
                    End Day — Start Fresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'history'  && <HistoryTab history={history} />}

          {tab === 'settings' && (
            <SettingsTab
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              onResetDay={handleResetDay}
              onClearHistory={() => setHistory([])}
            />
          )}
        </div>
      </main>
    </div>
  )
}
