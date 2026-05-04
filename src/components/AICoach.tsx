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

export function AICoach({
  journal,
  onJournalChange,
  onAnalyze,
  loading,
  response,
  error,
  hasApiKey,
}: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[3px] uppercase text-muted font-medium">
          🤖 AI Coach
        </p>
        <span className="bg-[#76b900] text-black text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">
          ⚡ NVIDIA NIM
        </span>
      </div>

      <textarea
        value={journal}
        onChange={(e) => onJournalChange(e.target.value)}
        placeholder="מה עשית היום? היה לך חשק? הצלחת בכל הדברים?"
        className="w-full bg-card2 border border-border rounded-xl p-3 text-text text-sm resize-none h-24 outline-none focus:border-accent/40 transition-colors placeholder:text-muted"
        dir="rtl"
      />

      {!hasApiKey && (
        <p className="text-[11px] text-muted mb-2 text-right">
          💡 ללא API Key תקבל פידבק אוטומטי
        </p>
      )}

      <button
        onClick={onAnalyze}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm tracking-wider text-black disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(90deg, #ff6b35, #f5c518)' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            מנתח...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            קבל פידבק מ-AI
          </>
        )}
      </button>

      {(response || error) && (
        <div
          className={`mt-3 p-4 bg-card2 rounded-xl border-r-4 text-sm leading-relaxed animate-fadeIn whitespace-pre-wrap ${
            error ? 'border-red-500 text-red-400' : 'border-accent text-text'
          }`}
          dir="rtl"
        >
          {error || response}
        </div>
      )}

      {loading && !response && (
        <div className="mt-3 flex items-center gap-2 text-muted text-xs p-3">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse2"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          <span className="mr-1">ה-AI מנתח את היום שלך...</span>
        </div>
      )}
    </div>
  )
}
