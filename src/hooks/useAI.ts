import { useState } from 'react'

interface UseAIResult {
  response: string
  loading: boolean
  error: string | null
  analyze: (journal: string, score: number, done: number, apiKey: string) => Promise<void>
  clear: () => void
}

export function useAI(): UseAIResult {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (journal: string, score: number, done: number, apiKey: string) => {
    if (!journal.trim()) {
      setError('כתוב קודם מה עשית היום...')
      return
    }

    if (!apiKey.trim()) {
      setResponse(generateLocalFeedback(score, done))
      return
    }

    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'z-ai/glm4.7',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: `אתה מאמן הצלחה קשוח וישיר בעברית. אל תיתן מחמאות סתם — תגיד את האמת.
ניקוד המשתמש היום: ${score}% (השלים ${done} מתוך 5 משימות).
ענה בפורמט הזה בדיוק:
🔢 ציון היום: ${score}%
✅ מה עשית טוב:
❌ איפה בזבזת:
🎯 3 משימות למחר:
💥 משפט אמת אחד (ישיר, בלי סוכר)`,
            },
            {
              role: 'user',
              content: `היום שלי: ${journal}`,
            },
          ],
        }),
      })

      const data = await res.json()

      if (data.choices?.[0]?.message?.content) {
        setResponse(data.choices[0].message.content as string)
      } else {
        setError(`שגיאה מה-API: ${JSON.stringify(data).slice(0, 200)}`)
      }
    } catch (e) {
      setError(`שגיאת חיבור: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setResponse('')
    setError(null)
  }

  return { response, loading, error, analyze, clear }
}

function generateLocalFeedback(score: number, done: number): string {
  if (score >= 80)
    return `🏆 ציון: ${score}% — יום מצוין!\n✅ השלמת ${done}/5 משימות.\n🎯 מחר: תמשיך בקצב ותוסיף פעולת כסף נוספת.\n💥 עקביות ל-60 יום = תוצאות אמיתיות.`
  if (score >= 40)
    return `⚡ ציון: ${score}% — בינוני. אתה יכול יותר.\n❌ פספסת ${5 - done} משימות.\n🎯 מחר: תעשה קודם את הדברים הכבדים.\n💥 הממוצע שלך מחר חייב להיות גבוה יותר.`
  return `🔴 ציון: ${score}% — יום חלש.\n❌ רוב הרשימה לא בוצעה.\n🎯 מחר: בחר 2 דברים ותעשה אותם בלי תירוצים.\n💥 כל יום כזה מרחיק אותך מהמטרה.`
}
