import { Eye, EyeOff, Bell, BellOff } from 'lucide-react'
import { useState } from 'react'

interface Props {
  apiKey: string
  onApiKeyChange: (v: string) => void
  onResetDay: () => void
  onClearHistory: () => void
  notificationsEnabled: boolean
  onToggleNotifications: () => void
}

function GoldAccent() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(to right, transparent, #e8a020, transparent)', opacity: 0.7 }}
    />
  )
}

export function SettingsTab({ apiKey, onApiKeyChange, onResetDay, onClearHistory, notificationsEnabled, onToggleNotifications }: Props) {
  const [show,  setShow]  = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-md flex flex-col gap-4">

      {/* API Key */}
      <div
        className="rounded-card p-6 relative overflow-hidden"
        style={{ background: '#131220', border: '1px solid #252336' }}
      >
        <GoldAccent />
        <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-2">NVIDIA NIM API Key</p>
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
              className="w-full bg-s2 rounded-xl px-4 py-3 text-sm text-text outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-muted pr-10 border border-border"
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
            className="px-5 rounded-xl text-sm font-bold text-black hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(90deg, #e8a020, #f5c435)' }}
          >
            {saved ? '✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div
        className="rounded-card p-6 relative overflow-hidden"
        style={{ background: '#131220', border: '1px solid #252336' }}
      >
        <GoldAccent />
        <div className="flex justify-between items-center mb-2">
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted">התראות מוטיבציה</p>
          {notificationsEnabled ? <Bell className="w-4 h-4 text-gold" /> : <BellOff className="w-4 h-4 text-muted" />}
        </div>
        <p className="text-xs text-sub mb-4 leading-relaxed">
          קבל משפטי מוטיבציה מתחלפים כהתראות למסך (פופ-אפים), כדי להישאר בפוקוס ולהמשיך לזוז.
        </p>
        <button
          onClick={onToggleNotifications}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all border"
          style={
            notificationsEnabled
              ? { background: 'rgba(232,160,32,0.1)', color: '#f5c435', borderColor: 'rgba(232,160,32,0.3)' }
              : { background: '#1a192b', color: '#8b8a9e', borderColor: '#252336' }
          }
        >
          {notificationsEnabled ? 'פועל - לחץ לכיבוי' : 'הפעל התראות קופצות'}
        </button>
      </div>

      {/* Model info */}
      <div
        className="rounded-card p-6 relative overflow-hidden"
        style={{ background: '#131220', border: '1px solid #252336' }}
      >
        <GoldAccent />
        <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-5">MODEL</p>
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
      <div
        className="rounded-card p-6 relative overflow-hidden"
        style={{ background: '#131220', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-5">DANGER ZONE</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { if (confirm('לאפס את היום הנוכחי?')) onResetDay() }}
            className="w-full py-3 rounded-xl bg-s2 text-sub text-sm font-medium hover:text-text border border-border transition-colors"
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
