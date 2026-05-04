import { Zap, Loader2 } from 'lucide-react'

interface Props {
  journal: string
  onJournalChange: (v: string) => void
  onAnalyze: () => void
  loading: boolean
  response: string
  error: string | null
  hasApiKey: boolean
}

export function AICoach({ journal, onJournalChange, onAnalyze, loading, response, error, hasApiKey }: Props) {
  return (
    <div className="bg-surface rounded-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Daily Debrief</p>
        <div className="flex items-center gap-1.5 bg-surface2 rounded-lg px-2.5 py-1.5">
          <Zap className="w-3 h-3 text-sub" strokeWidth={1.5} />
          <span className="text-[9px] tracking-[2px] uppercase font-semibold text-sub">AI Coach</span>
        </div>
      </div>

      <textarea
        value={journal}
        onChange={(e) => onJournalChange(e.target.value)}
        placeholder="מה קרה היום? עמדת ביעדים? היכן נכשלת? מה למדת?"
        className="flex-1 min-h-[100px] w-full bg-surface2 rounded-xl p-4 text-sm text-text resize-none outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:text-muted leading-relaxed"
        dir="rtl"
      />

      {!hasApiKey && (
        <p className="text-[10px] text-muted mt-2 text-right">ללא API Key — פידבק אוטומטי</p>
      )}

      <button
        onClick={onAnalyze}
        disabled={loading}
        className="mt-4 w-full py-3.5 rounded-xl font-semibold text-sm bg-white text-black disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> מנתח</>
        ) : (
          <><Zap className="w-4 h-4" /> קבל פידבק</>
        )}
      </button>

      {loading && !response && (
        <div className="flex items-center gap-2 mt-4">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-1.5 h-1.5 bg-white rounded-full animate-pulse2" style={{ animationDelay: `${d}ms` }} />
          ))}
          <span className="text-[10px] text-muted ml-1 tracking-wide">מעבד</span>
        </div>
      )}

      {(response || error) && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm leading-relaxed animate-fadeUp whitespace-pre-wrap ${
            error ? 'bg-red-500/10 text-red-400' : 'bg-surface2 text-sub'
          }`}
          dir="rtl"
        >
          {error || response}
        </div>
      )}
    </div>
  )
}
