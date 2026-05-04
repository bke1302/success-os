import { Eye, EyeOff, Save } from 'lucide-react'
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

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* API Key */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] tracking-[3px] uppercase text-muted mb-1 font-medium">
          🔑 NVIDIA NIM API Key
        </p>
        <p className="text-xs text-muted mb-4 opacity-70">
          מ־{' '}
          <a
            href="https://build.nvidia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
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
              className="w-full bg-card2 border border-border rounded-xl px-3 py-3 text-sm text-text outline-none focus:border-accent/40 transition-colors placeholder:text-muted pr-10"
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="bg-accent text-black px-4 rounded-xl font-semibold text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            {saved ? 'נשמר!' : 'שמור'}
          </button>
        </div>
      </div>

      {/* Model info */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] tracking-[3px] uppercase text-muted mb-3 font-medium">
          ⚙️ מידע על המודל
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">מודל</span>
            <span className="text-text font-mono text-xs">z-ai/glm4.7</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">ספק</span>
            <span className="text-[#76b900] font-bold text-xs">NVIDIA NIM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">עלות</span>
            <span className="text-success text-xs">חינמי (קרדיט ראשוני)</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-red-900/40 rounded-2xl p-5">
        <p className="text-[10px] tracking-[3px] uppercase text-red-400 mb-4 font-medium">
          ⚠️ אזור מסוכן
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (confirm('לאפס את היום הנוכחי?')) onResetDay()
            }}
            className="w-full py-3 rounded-xl border border-accent2/40 text-accent2 text-sm font-medium hover:bg-accent2/10 transition-colors"
          >
            🔄 איפוס יום נוכחי
          </button>
          <button
            onClick={() => {
              if (confirm('למחוק את כל ההיסטוריה? פעולה זו לא ניתנת לביטול!'))
                onClearHistory()
            }}
            className="w-full py-3 rounded-xl border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            🗑️ מחיקת כל ההיסטוריה
          </button>
        </div>
      </div>
    </div>
  )
}
