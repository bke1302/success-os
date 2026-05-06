import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface Props {
  apiKey: string
  onApiKeyChange: (v: string) => void
  onResetDay: () => void
  onClearHistory: () => void
}

export function SettingsTab({ apiKey, onApiKeyChange, onResetDay, onClearHistory }: Props) {
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-md flex flex-col gap-4">

      {/* API Key */}
      <div className="bg-surface rounded-card p-6 border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-5">NVIDIA NIM API Key</p>
        <p className="text-xs text-sub mb-4 leading-relaxed">
          השג מפתח ב{' '}
          <a
            href="https://build.nvidia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4 hover:text-gold2 transition-colors"
          >
            build.nvidia.com
          </a>
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="nvapi-..."
              dir="ltr"
              className="w-full bg-surface2 rounded-xl px-4 py-3 text-sm text-text outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-muted pr-10 border border-border"
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
            className="px-5 rounded-xl text-sm font-semibold text-black hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(90deg, #d4a43a, #f5c842)' }}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Model info */}
      <div className="bg-surface rounded-card p-6 border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-5">Model</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Model',    value: 'z-ai/glm4.7'          },
            { label: 'Provider', value: 'NVIDIA NIM'            },
            { label: 'Cost',     value: 'Free (initial credit)' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-sm text-text font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-surface rounded-card p-6 border border-red-900/30 relative overflow-hidden">
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-5">Danger Zone</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { if (confirm('לאפס את היום הנוכחי?')) onResetDay() }}
            className="w-full py-3 rounded-xl bg-surface2 text-sub text-sm font-medium hover:text-text border border-border transition-colors"
          >
            Reset Day
          </button>
          <button
            onClick={() => { if (confirm('למחוק את כל ההיסטוריה?')) onClearHistory() }}
            className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/15 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

    </div>
  )
}
