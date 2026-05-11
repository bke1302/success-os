import { useState } from 'react'

interface UseAIResult {
  response: string
  loading: boolean
  error: string | null
  analyze: (journal: string, score: number, done: number, apiKey: string, streak: number, mainTaskDone: boolean) => Promise<void>
  clear: () => void
}

export function useAI(): UseAIResult {
  const [response, setResponse] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const analyze = async (
    journal:      string,
    score:        number,
    done:         number,
    apiKey:       string,
    streak:       number,
    mainTaskDone: boolean,
  ) => {
    if (!journal.trim()) {
      setError('כתוב קודם מה עשית היום...')
      return
    }

    if (!apiKey.trim()) {
      setResponse(generateLocalFeedback(score, done, streak, mainTaskDone))
      return
    }

    setLoading(true)
    setError(null)
    setResponse('')

    const systemPrompt = `אתה David Goggins של אימוני הצלחה — קשוח, ישיר, ללא רחמים, אבל עם מטרה אחת: לדחוף את המשתמש להגיע למקסימום שלו.

נתוני היום:
- ציון: ${score}% (${done}/5 משימות הושלמו)
- המשימה הראשית: ${mainTaskDone ? '✅ הושלמה' : '❌ לא הושלמה'}
- streak נוכחי: ${streak} ימים

כללי תגובה:
1. אל תתחיל בברכות. ישר לעניין.
2. אם הציון מתחת ל-60% — אל תנחם. תגיד את האמת בצורה שכואבת מספיק לשנות התנהגות.
3. אם הציון מעל 80% — תכיר בזה, אבל תאתגר עוד.
4. המשפט האחרון חייב להיות אחד — הכי ישיר, הכי אמיתי, שנשאר.
5. תשתמש בעברית ספוקנית, לא ספרותית.

פורמט חובה:
🔢 ציון: [score]% | streak: [streak] ימים
---
✅ [מה עשית טוב — ספציפי לפי היומן]
❌ [מה פספסת — ישיר, לא עם כפפות]
🎯 3 פעולות ספציפיות למחר (לא "תתמיד" — פעולות אמיתיות)
💥 [משפט אמת אחד — אחד בלבד]`

    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'z-ai/glm4.7',
          max_tokens: 1024,
          temperature: 0.85,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: `היומן שלי להיום:\n${journal}` },
          ],
        }),
      })

      const data = await res.json() as { choices?: { message?: { content?: string } }[] }

      if (data.choices?.[0]?.message?.content) {
        setResponse(data.choices[0].message.content)
      } else {
        setError(`שגיאה מה-API: ${JSON.stringify(data).slice(0, 200)}`)
      }
    } catch (e) {
      setError(`שגיאת חיבור: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => { setResponse(''); setError(null) }

  return { response, loading, error, analyze, clear }
}

function generateLocalFeedback(score: number, done: number, streak: number, mainTaskDone: boolean): string {
  const missed = 5 - done
  const streakLine = streak > 0 ? `\n⚡ streak: ${streak} ימים — אל תשבור את הרצף.` : ''
  const missionLine = mainTaskDone ? '\n🎯 המשימה הראשית הושלמה — זה מה שחשוב.' : '\n❌ המשימה הראשית לא הושלמה. זו הייתה העדיפות.'

  if (score >= 80) return (
    `🏆 ציון: ${score}% | ELITE DAY${streakLine}${missionLine}\n` +
    `✅ השלמת ${done}/5 — יום חזק.\n` +
    `🎯 מחר: הוסף פעולת כסף, קרא פרק נוסף, ותוסיף 5 דקות לאימון.\n` +
    `💥 עקביות של 60 יום ברמה הזו = חיים שונים לחלוטין.`
  )
  if (score >= 40) return (
    `⚡ ציון: ${score}% — בינוני. אתה יכול יותר.${streakLine}${missionLine}\n` +
    `❌ פספסת ${missed} משימות. כל אחת מהן עלתה לך כסף ושעות.\n` +
    `🎯 מחר: קום שעה מוקדם יותר, עשה את הכבד ראשון, אל תפתח טלפון לפני 10:00.\n` +
    `💥 האנשים שאתה מקנא בהם לא פספסו ${missed} משימות היום.`
  )
  return (
    `🔴 ציון: ${score}% — יום חלש.${streakLine}${missionLine}\n` +
    `❌ ${missed} מתוך 5 משימות לא בוצעו. זו לא גזרת גורל — זו החלטה.\n` +
    `🎯 מחר: בחר 2 משימות בלבד ועשה אותן לפני 12:00.\n` +
    `💥 כל יום כזה הוא יום שנוסף בין מי שאתה לבין מי שאתה רוצה להיות.`
  )
}
