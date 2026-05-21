// Claude AI Coach — calls a proxy worker (user-deployed)
// Fallback: null (rule-based coach in aiCoach.ts takes over)

const STORAGE_KEY = 'success_ai_coach_url'

export function getAICoachURL(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

export function setAICoachURL(url: string) {
  if (url) localStorage.setItem(STORAGE_KEY, url.trim())
  else localStorage.removeItem(STORAGE_KEY)
}

export interface CoachContext {
  name:        string
  score:       number
  win:         string
  lesson:      string
  streak:      number
  avg7:        number | null
  habitsDone:  number
  totalHabits: number
}

export async function callAICoach(ctx: CoachContext): Promise<string | null> {
  const url = getAICoachURL()
  if (!url) return null

  const prompt = buildPrompt(ctx)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) return null
    const data = await res.json() as { response?: string }
    return data.response?.trim() || null
  } catch {
    return null
  }
}

function buildPrompt(ctx: CoachContext): string {
  const scoreZone =
    ctx.score >= 9 ? 'שיא — יום שיא מוחלט' :
    ctx.score >= 7 ? 'חזק — יום מוצלח' :
    ctx.score >= 5 ? 'בינוני — ביצוע בסיסי' :
    'קשה — יום מאתגר'

  return `אתה מאמן אישי בשם "SUCCESS OS". תפקידך לתת תגובה קצרה, אמיתית ומשמעותית לסיכום יומי של המשתמש.

המשתמש: ${ctx.name}
ציון: ${ctx.score}/10 (${scoreZone})
מה נתן היום: "${ctx.win}"
לקח: "${ctx.lesson}"
רצף: ${ctx.streak} ימים
ממוצע 7 ימים: ${ctx.avg7 != null ? ctx.avg7 : 'לא מספיק נתונים עדיין'}
הרגלים: ${ctx.habitsDone}/${ctx.totalHabits}

כתוב תגובה של 2-3 משפטים בעברית. דבר ישירות אל המשתמש בגוף שני. היה ספציפי — הזכר את מה שנתן ואת הלקח.
- ציון 8+: חזק ואמיתי, תן תובנה עמוקה על ההצלחה הספציפית הזאת
- ציון 5-7: מעצים, הצבע על דבר אחד קונקרטי לשיפור
- ציון מתחת ל-5: תומך ואמיתי, הזכר שהנוכחות עצמה היא ניצחון

אל תשתמש בסיסמאות. אל תאמר "כל הכבוד" או "מדהים". דבר כמו מאמן אמיתי.`
}
