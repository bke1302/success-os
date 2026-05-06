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
    <div className="bg-surface rounded-card p-6 border border-border flex flex-col relative overflow-hidden">
      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Daily Debrief</p>
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border"
          style={{ borderColor: 'rgba(212,164,58,0.4)', background: 'rgba(212,164,58,0.06)' }}
        >
          <Zap className="w-3 h-3 text-gold" strokeWidth={1.5} />
          <span className="text-[9px] tracking-[2px] uppercase font-semibold text-gold">AI Coach</span>
        </div>
      </div>

      <textarea
        value={journal}
        onChange={(e) => onJournalChange(e.target.value)}
        placeholder="מה קרה היום? עמדת ביעדים? היכן נכשלת? מה למדת?"
        className="flex-1 min-h-[100px] w-full bg-surface2 rounded-xl p-4 text-base text-white font-medium resize-none outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-muted leading-relaxed border border-border"
        dir="rtl"
      />

      {!hasApiKey && (
        <p className="text-[10px] text-muted mt-2 text-right">ללא API Key — פידבק אוטומטי</p>
      )}

      <button
        onClick={onAnalyze}
        disabled={loading}
        className="mt-4 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide uppercase text-black disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(90deg, #d4a43a, #f5c842)' }}
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
            <span
              key={d}
              className="w-1.5 h-1.5 rounded-full animate-pulse2"
              style={{ background: '#d4a43a', animationDelay: `${d}ms` }}
            />
          ))}
          <span className="text-[10px] text-muted ml-1 tracking-wide">מעבד</span>
        </div>
      )}

      {(response || error) && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm leading-relaxed animate-fadeUp whitespace-pre-wrap border-r-2 ${
            error
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 border-r-red-500/50'
              : 'bg-surface2 text-sub border border-border/50 border-r-gold/50'
          }`}
          dir="rtl"
        >
          {error || response}
        </div>
      )}
    </div>
  )
}
