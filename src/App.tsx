import { useState, useEffect } from 'react'
import { LayoutDashboard, History, Settings, Target } from 'lucide-react'
import { ChecklistCard } from './components/ChecklistCard'
import { ScoreCard }     from './components/ScoreCard'
import { AICoach }       from './components/AICoach'
import { HistoryTab }    from './components/HistoryTab'
import { SettingsTab }   from './components/SettingsTab'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAI }           from './hooks/useAI'
import { QUOTES }          from './constants'
import type { DayLog, TabId } from './types'

const TOTAL_CHECKS = 5

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [checks,   setChecks]   = useLocalStorage<Record<string, boolean>>('ss_checks',  {})
  const [journal,  setJournal]  = useLocalStorage<string>('ss_journal',  '')
  const [mainTask, setMainTask] = useLocalStorage<string>('ss_maintask', '')
  const [apiKey,   setApiKey]   = useLocalStorage<string>('ss_apikey',   '')
  const [streak,   setStreak]   = useLocalStorage<number>('ss_streak',   3)
  const [dayCount, setDayCount] = useLocalStorage<number>('ss_day',      1)
  const [history,  setHistory]  = useLocalStorage<DayLog[]>('ss_history', [])

  const { response, loading, error, analyze, clear } = useAI()

  const [quoteIndex,   setQuoteIndex]   = useState(() => new Date().getDay() % QUOTES.length)
  const [quoteVisible, setQuoteVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 600)
    }, 3 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const done  = Object.values(checks).filter(Boolean).length
  const score = Math.round((done / TOTAL_CHECKS) * 100)

  const handleToggle    = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }))
  const handleAnalyze   = () => void analyze(journal, score, done, apiKey)

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

      {/* ── Collapsible Sidebar ── */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`fixed right-0 top-0 h-screen bg-surface border-l border-border flex flex-col z-20
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${sidebarOpen ? 'w-52 shadow-2xl shadow-black/60' : 'w-14'}`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border shrink-0 overflow-hidden">
          {sidebarOpen ? (
            <div className="animate-fadeUp">
              <div className="font-display text-3xl tracking-widest text-white leading-none">SUCCESS</div>
              <div className="font-display text-3xl tracking-widest text-white leading-none">OS</div>
              <p className="text-[8px] tracking-[4px] uppercase font-semibold text-muted mt-2">Performance</p>
            </div>
          ) : (
            <div className="font-display text-2xl tracking-widest text-white text-center">S</div>
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
                            ? 'bg-white text-black'
                            : 'text-muted hover:text-white hover:bg-surface2'
                          }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={tab === id ? 2.5 : 1.5} />
              {sidebarOpen && (
                <span className="text-xs font-semibold whitespace-nowrap animate-fadeUp">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quote bottom */}
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

      {/* ── Main content (fixed mr-14 = collapsed sidebar width) ── */}
      <main className="flex-1 mr-14 flex flex-col min-h-screen">

        {/* Quote Hero */}
        <div className="relative overflow-hidden border-b border-border px-8 py-10 text-center">
          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            aria-hidden
          >
            <span className="font-display text-[220px] leading-none text-white/[0.025]">"</span>
          </div>

          <p className="text-[8px] tracking-[6px] uppercase font-semibold text-muted mb-5">
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <p
            className="relative text-2xl font-medium text-white max-w-2xl mx-auto leading-relaxed transition-opacity duration-600"
            style={{ opacity: quoteVisible ? 1 : 0 }}
          >
            {QUOTES[quoteIndex]}
          </p>
        </div>

        {/* Page content */}
        <div className="flex-1 px-8 py-6">

          {/* TODAY */}
          {tab === 'today' && (
            <div className="flex flex-col gap-4 max-w-5xl">

              {/* Score — full width */}
              <ScoreCard score={score} done={done} total={TOTAL_CHECKS} streak={streak} dayCount={dayCount} />

              {/* Two columns */}
              <div className="grid grid-cols-2 gap-4">

                {/* Right — Checklist */}
                <ChecklistCard checks={checks} onToggle={handleToggle} />

                {/* Left — Mission + AI + End Day */}
                <div className="flex flex-col gap-4">

                  {/* Mission */}
                  <div className="bg-surface rounded-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                      <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Primary Mission</p>
                    </div>
                    <textarea
                      value={mainTask}
                      onChange={(e) => setMainTask(e.target.value)}
                      placeholder="המשימה האחת שתגדיר את ההצלחה של היום"
                      className="w-full bg-surface2 rounded-xl p-4 text-sm text-text resize-none h-24 outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted leading-relaxed"
                      dir="rtl"
                    />
                  </div>

                  {/* AI Coach */}
                  <AICoach
                    journal={journal}
                    onJournalChange={setJournal}
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    response={response}
                    error={error}
                    hasApiKey={!!apiKey}
                  />

                  {/* End Day */}
                  <button
                    onClick={handleResetDay}
                    className="w-full py-3.5 rounded-xl bg-surface text-sub text-sm font-medium hover:text-white hover:bg-surface2 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <History className="w-4 h-4" strokeWidth={1.5} />
                    End Day — Start Fresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'history' && <HistoryTab history={history} />}

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
