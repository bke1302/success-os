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
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Gold top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.6), transparent)' }}
      />

      <div className="p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">DAILY DEBRIEF</p>
          <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 border"
            style={{ borderColor: 'rgba(232,160,32,0.35)', background: 'rgba(232,160,32,0.08)', color: '#e8a020' }}
          >
            <Zap className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[8px] tracking-[2px] uppercase font-bold">AI</span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={journal}
          onChange={(e) => onJournalChange(e.target.value)}
          placeholder="מה קרה היום? עמדת ביעדים? היכן נכשלת?"
          className="w-full rounded-xl p-4 text-sm text-white font-medium resize-none outline-none transition-all placeholder:text-muted leading-relaxed"
          style={{
            height: '88px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          dir="rtl"
        />

        {!hasApiKey && (
          <p className="text-[9px] text-muted text-right">ללא API Key — פידבק אוטומטי</p>
        )}

        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-[10px] tracking-[4px] uppercase text-black disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(90deg, #e8a020, #f5c435)', boxShadow: '0 0 20px rgba(232,160,32,0.2)' }}
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> מנתח...</>
          ) : (
            <><Zap className="w-3.5 h-3.5" /> GET FEEDBACK</>
          )}
        </button>

        {/* Loading dots */}
        {loading && !response && (
          <div className="flex items-center gap-2">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full animate-pulse2"
                style={{ background: '#e8a020', animationDelay: `${d}ms` }}
              />
            ))}
            <span className="text-[10px] text-muted tracking-wide">מעבד</span>
          </div>
        )}

        {/* Response */}
        {(response || error) && (
          <div
            className={`p-4 rounded-xl text-sm leading-relaxed animate-fadeUp whitespace-pre-wrap border-r-2 ${
              error
                ? 'text-red-400'
                : 'text-sub'
            }`}
            style={
              error
                ? { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.5)' }
                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(232,160,32,0.4)' }
            }
            dir="rtl"
          >
            {error || response}
          </div>
        )}
      </div>
    </div>
  )
}
