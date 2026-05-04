import { useState, useMemo } from 'react'
import { LayoutDashboard, History, Settings } from 'lucide-react'
import { ChecklistCard } from './components/ChecklistCard'
import { ScoreCard } from './components/ScoreCard'
import { AICoach } from './components/AICoach'
import { HistoryTab } from './components/HistoryTab'
import { SettingsTab } from './components/SettingsTab'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAI } from './hooks/useAI'
import { QUOTES } from './constants'
import type { DayLog, TabId } from './types'

const TOTAL_CHECKS = 5

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>('ss_checks', {})
  const [journal, setJournal] = useLocalStorage<string>('ss_journal', '')
  const [mainTask, setMainTask] = useLocalStorage<string>('ss_maintask', '')
  const [apiKey, setApiKey] = useLocalStorage<string>('ss_apikey', '')
  const [streak, setStreak] = useLocalStorage<number>('ss_streak', 3)
  const [dayCount, setDayCount] = useLocalStorage<number>('ss_day', 1)
  const [history, setHistory] = useLocalStorage<DayLog[]>('ss_history', [])

  const { response, loading, error, analyze, clear } = useAI()

  const quote = useMemo(() => QUOTES[new Date().getDay() % QUOTES.length], [])

  const done = Object.values(checks).filter(Boolean).length
  const score = Math.round((done / TOTAL_CHECKS) * 100)

  const handleToggle = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAnalyze = () => {
    void analyze(journal, score, done, apiKey)
  }

  const handleResetDay = () => {
    // Save current day to history
    if (journal || done > 0) {
      const log: DayLog = {
        date: new Date().toLocaleDateString('he-IL'),
        score,
        journal,
        mainTask,
        checks: { ...checks },
        aiResponse: response,
      }
      setHistory((prev) => [...prev, log])
    }
    setChecks({})
    setJournal('')
    setMainTask('')
    clear()
    setDayCount((d) => d + 1)
    const newStreak = done >= 3 ? Math.min(streak + 1, 7) : 1
    setStreak(newStreak)
  }

  const handleClearHistory = () => {
    setHistory([])
  }

  const tabs: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
    { id: 'today', label: 'היום', Icon: LayoutDashboard },
    { id: 'history', label: 'היסטוריה', Icon: History },
    { id: 'settings', label: 'הגדרות', Icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-bg text-text" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-5xl tracking-widest bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent leading-none">
            SUCCESS OS
          </h1>
          <p className="text-[10px] tracking-[4px] uppercase text-muted mt-2">
            Your Daily Performance System
          </p>
        </div>

        {/* Quote bar */}
        <div className="bg-gradient-to-l from-transparent to-accent2/10 border-r-4 border-accent2 px-4 py-3 rounded-lg mb-6 text-sm italic">
          {quote}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === id
                  ? 'bg-accent text-black'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Today Tab */}
        {tab === 'today' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <ChecklistCard checks={checks} onToggle={handleToggle} />
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
            <div className="flex flex-col gap-4">
              <ScoreCard
                score={score}
                done={done}
                total={TOTAL_CHECKS}
                streak={streak}
                dayCount={dayCount}
              />
              {/* Main task */}
              <div className="bg-card border border-accent/20 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a0a00, #12121a)' }}>
                <p className="text-[10px] tracking-[3px] uppercase text-muted mb-3 font-medium">
                  🎯 המשימה הכי חשובה היום
                </p>
                <textarea
                  value={mainTask}
                  onChange={(e) => setMainTask(e.target.value)}
                  placeholder="מה הדבר האחד שאם תעשה אותו — היום יהיה הצלחה?"
                  className="w-full bg-black/30 border border-border rounded-xl p-3 text-text text-sm resize-none h-20 outline-none focus:border-accent/40 transition-colors placeholder:text-muted"
                  dir="rtl"
                />
              </div>

              <button
                onClick={handleResetDay}
                className="w-full py-3 rounded-xl border border-border text-muted text-sm hover:border-accent2/40 hover:text-accent2 transition-all duration-200"
              >
                🔄 סיים יום ועבור לחדש
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && <HistoryTab history={history} />}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <SettingsTab
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onResetDay={handleResetDay}
            onClearHistory={handleClearHistory}
          />
        )}
      </div>
    </div>
  )
}
