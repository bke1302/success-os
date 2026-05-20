// Rule-based AI Coach — analyzes user data patterns and generates insights
import type { DayEntry } from '../types'

export interface CoachReport {
  headline:   string
  insights:   string[]
  challenge:  string
  tone:       'fire' | 'gold' | 'green'
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function generateCoachReport(entries: DayEntry[], streak: number): CoachReport {
  const withEvening = entries.filter(e => e.evening)
  const last7  = withEvening.slice(-7)
  const last30 = withEvening.slice(-30)

  if (withEvening.length < 3) {
    return {
      headline:  'ברוך הבא למסע',
      insights:  ['אתה בתחילת המסע — כל יום שאתה מסיים הוא ניצחון', 'הרגל מתחיל אחרי 21 יום — תן לזה זמן', 'הכי חשוב עכשיו: עקביות על פני מצוינות'],
      challenge: 'סיים 7 ימים ברצף — לא יותר, לא פחות. רק 7.',
      tone: 'gold',
    }
  }

  const insights: string[] = []

  // ── Trend analysis ─────────────────────────────────────────────
  const recentAvg = avg(last7.map(e => e.evening!.score))
  const olderAvg  = avg(last30.slice(0, -7).map(e => e.evening!.score))

  if (recentAvg >= olderAvg + 1) {
    insights.push(`הציון הממוצע שלך עלה ב-${(recentAvg - olderAvg).toFixed(1)} נקודות השבוע — אתה בעלייה 📈`)
  } else if (recentAvg <= olderAvg - 1) {
    insights.push(`הציון ירד ב-${(olderAvg - recentAvg).toFixed(1)} נקודות השבוע — זה לא שקיעה, זה אות לשינוי`)
  }

  // ── Weak day pattern ──────────────────────────────────────────
  const byDay: Record<number, number[]> = {}
  for (const e of withEvening) {
    const [y, m, d] = e.date.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    if (!byDay[dow]) byDay[dow] = []
    byDay[dow].push(e.evening!.score)
  }
  let weakestDow = -1, weakestAvg = 10
  for (const [dow, scores] of Object.entries(byDay)) {
    if (scores.length >= 2) {
      const a = avg(scores)
      if (a < weakestAvg) { weakestAvg = a; weakestDow = Number(dow) }
    }
  }
  if (weakestDow >= 0 && weakestAvg < 6) {
    const names = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
    insights.push(`יום ${names[weakestDow]} הוא הנקודה החלשה שלך (ממוצע ${weakestAvg.toFixed(1)}) — מה קורה ביום הזה?`)
  }

  // ── Commitment rate ───────────────────────────────────────────
  const commitRate = Math.round(last30.filter(e => e.evening!.commitmentDone).length / last30.length * 100)
  if (commitRate >= 80) {
    insights.push(`אתה עומד בהתחייבויות שלך ${commitRate}% מהזמן — זאת רמת קצין`)
  } else if (commitRate >= 60) {
    insights.push(`${commitRate}% עמידה בהתחייבויות — טוב, אבל הגדולה מתחילה מ-80%. מה מפריע?`)
  } else {
    insights.push(`${commitRate}% עמידה בהתחייבויות — האם ההתחייבויות שלך מציאותיות מדי? קטן ועקבי עוקף גדול ולא עקבי`)
  }

  // ── Streak message ───────────────────────────────────────────
  if (streak >= 30) {
    insights.push(`${streak} ימים ברצף — אתה בעל ברית עם ההרגל. זה לא ניתן להסרה מהזהות שלך`)
  } else if (streak >= 14) {
    insights.push(`${streak} ימים ברצף — אתה חוצה את קו ה-21 בקרוב. שם ההרגל הופך לאוטומטי`)
  } else if (streak >= 7) {
    insights.push(`שבוע ברצף — אתה מוכיח שאתה יכול. עכשיו הכפל את זה`)
  }

  // ── Peak days ────────────────────────────────────────────────
  const peakCount = last30.filter(e => e.evening!.score >= 9).length
  if (peakCount >= 5) {
    insights.push(`${peakCount} ימי PEAK החודש — אתה יודע מה זה להיות בשיא. השאלה היא איך להכפיל את זה`)
  }

  // ── Habits ───────────────────────────────────────────────────
  const withHabits = last7.filter(e => e.habits && e.habits.length > 0)
  if (withHabits.length === 0) {
    insights.push('לא נרשמו פעולות השבוע — הפעולות הן הדלק. בלעדיהן הכוונה מתנפחת אבל לא זז כלום')
  } else {
    const habitAvg = avg(withHabits.map(e => e.habits!.length))
    if (habitAvg >= 4) insights.push(`ממוצע ${habitAvg.toFixed(0)} פעולות ביום השבוע — זה אתה שמממש, לא רק מתכנן`)
  }

  // ── Fallback ─────────────────────────────────────────────────
  if (insights.length < 2) {
    insights.push('המוח שלך מתחיל לזהות pattern חיובי. כל יום שאתה מסיים בסיכום — אתה שולח הודעה לתת-מודע שלך')
  }

  // ── Tone ─────────────────────────────────────────────────────
  const tone: 'fire' | 'gold' | 'green' =
    recentAvg >= 8 ? 'green' :
    recentAvg <= 5 ? 'fire'  : 'gold'

  // ── Headline ─────────────────────────────────────────────────
  const headlines = {
    fire:  ['הגיע הזמן לעלות רמה', 'הנוחות הורגת את הגדולה', 'מה שאתה עושה עכשיו קובע מי תהיה'],
    gold:  ['אתה על הדרך הנכונה', 'עקביות > עוצמה', 'כל יום שאתה מסיים הוא קציר'],
    green: ['אתה בשיא — אל תפסיק', 'momentum בנוי. תנצל אותו', 'זו הגדילה שחיכית לה'],
  }
  const headline = headlines[tone][Math.floor(Date.now() / 86_400_000) % 3]

  // ── Weekly challenge ─────────────────────────────────────────
  const challenges = [
    'השבוע — כתוב lesson כל יום. לא תקציר. תובנה אחת חדה.',
    'השבוע — סיים כל יום לפני 22:00. איכות שינה = 30% מהביצועים.',
    `השבוע — הגע ל-${Math.min(10, Math.ceil(recentAvg) + 1)} ציון ביום אחד לפחות.`,
    'השבוע — שתף ניצחון יומי אחד עם מישהו. אחריות חברתית מכפילה.',
    'השבוע — אסור לדלג על אף פעולת חובה. שבעה ימים נקיים.',
    `השבוע — כתוב "THE ONE THING" שלך לפני שאתה פותח אפליקציה אחרת.`,
  ]
  const challenge = challenges[Math.floor(Date.now() / 604_800_000) % challenges.length]

  return { headline, insights: insights.slice(0, 4), challenge, tone }
}

// ── Daily Brief ──────────────────────────────────────────────────────────────

export interface DailyBrief {
  headline: string
  body:     string
  tone:     'fire' | 'gold' | 'green'
}

export function generateDailyBrief(entries: DayEntry[], streak: number): DailyBrief {
  const withEvening = entries.filter(e => e.evening)
  const last7 = withEvening.slice(-7)

  if (withEvening.length < 2) {
    return {
      headline: 'מוכן ליום חדש',
      body: 'כל יום שאתה מתחיל בכוונה — אתה מרחיק את הממוצע. יאללה.',
      tone: 'gold',
    }
  }

  const recentAvg = avg(last7.map(e => e.evening!.score))
  const tone: 'fire' | 'gold' | 'green' = recentAvg >= 8 ? 'green' : recentAvg <= 5 ? 'fire' : 'gold'
  const avgHabits = last7.length ? Math.round(avg(last7.map(e => (e.habits?.length ?? 0)))) : 0

  const headlines = {
    fire:  ['היום שובר את הדפוס', 'הזמן לשנות כיוון', 'אתה חזק יותר מהתוצאה'],
    gold:  ['אתה על המסלול', 'הממוצע שלך עולה', 'עוד יום, עוד צעד קדימה'],
    green: ['אתה בשיא — אל תפסיק', 'MOMENTUM בנוי', 'אלוף בפעולה'],
  }
  const headline = headlines[tone][Math.floor(Date.now() / 86_400_000) % 3]

  const parts: string[] = [`ממוצע 7 ימים: ${recentAvg.toFixed(1)}/10`]
  if (avgHabits > 0) parts.push(`${avgHabits} פעולות ממוצע ביום`)
  if (streak >= 3)   parts.push(`${streak} ימים ברצף — שמור על זה`)

  return { headline, body: parts.join(' · '), tone }
}

export function getLastMondayDate(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d.toISOString().slice(0, 10)
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}

// Return the day-of-week string for a YYYY-MM-DD date
export function getWeakestDay(entries: DayEntry[]): string | null {
  const withEvening = entries.filter(e => e.evening)
  const byDay: Record<number, number[]> = {}
  for (const e of withEvening) {
    const [y, m, d] = e.date.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    if (!byDay[dow]) byDay[dow] = []
    byDay[dow].push(e.evening!.score)
  }
  let weakestDow = -1, weakestAvg = 10
  for (const [dow, scores] of Object.entries(byDay)) {
    if (scores.length >= 2) {
      const a = scores.reduce((a,b)=>a+b,0)/scores.length
      if (a < weakestAvg) { weakestAvg = a; weakestDow = Number(dow) }
    }
  }
  if (weakestDow < 0) return null
  return ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'][weakestDow]
}
