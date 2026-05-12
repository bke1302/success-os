// ─── Coach Message Engine ─────────────────────────────────────────────────────
// Rule-based messages that respond to the user's state.
// The coach is direct, demanding, and never soft.

export interface CoachContext {
  streak:             number   // consecutive days with score >= 6
  dayCount:           number   // total days in program
  yesterdayHabitsPct: number   // 0–1, fraction of habits completed yesterday
  currentHour:        number   // 0–23
}

export interface CoachMessage {
  title: string
  body:  string
  tone:  'fire' | 'gold' | 'green'
}

export function getCoachMessage(ctx: CoachContext): CoachMessage {
  const { streak, dayCount, yesterdayHabitsPct, currentHour } = ctx

  // ── First ever day ────────────────────────────────────────────────────────
  if (dayCount <= 1) return {
    title: 'זה מתחיל עכשיו',
    body:  'רוב האנשים ידברו על שינוי כל חייהם ולא יעשו דבר. אתה פה. זה כבר משהו. עכשיו תוכיח שאתה רציני.',
    tone:  'gold',
  }

  // ── Streak milestones ─────────────────────────────────────────────────────
  if (streak >= 30) return {
    title: `${streak} ימים רצופים — אתה שונה`,
    body:  'חודש שלם של החלטות נכונות. זו לא עוד מוטיבציה — זו הזהות שלך. אל תפסיק עכשיו.',
    tone:  'green',
  }
  if (streak >= 14) return {
    title: `${streak} ימים רצופים`,
    body:  'שבועיים של קביעות. הגוף משתנה. המוח משתנה. אתה לא אותו אדם שהתחיל את התוכנית.',
    tone:  'green',
  }
  if (streak >= 7) return {
    title: 'שבוע רצוף — זה מתחיל להיות אמיתי',
    body:  'שבוע שלם בלי להיכנע. כל נוירון במוח שלך עכשיו בונה את הגרסה החדשה שלך. תמשיך.',
    tone:  'green',
  }
  if (streak >= 3) return {
    title: `${streak} ימים רצופים`,
    body:  'אתה בדרך. אל תשבור את הרצף — לשמור על רצף קל בהרבה מלבנות אחד מחדש.',
    tone:  'gold',
  }

  // ── Yesterday was rough ───────────────────────────────────────────────────
  if (dayCount > 1 && yesterdayHabitsPct < 0.34) return {
    title: 'אתמול פספסת את רוב המשימות',
    body:  'אתה יודע למה זה קרה. עכשיו תחליט — האם זה דפוס שחוזר על עצמו, או חד פעמי? רק הפעולות שלך יענו על זה.',
    tone:  'fire',
  }
  if (dayCount > 1 && yesterdayHabitsPct < 0.67) return {
    title: 'חצי — זה לא מספיק',
    body:  'אתמול עשית חלק. טוב, אבל לא מספיק. היום אתה מסיים הכל. לא מחר. לא אחר כך. היום.',
    tone:  'fire',
  }

  // ── Yesterday was perfect ─────────────────────────────────────────────────
  if (dayCount > 1 && yesterdayHabitsPct >= 1) return {
    title: 'אתמול היה מושלם',
    body:  'השלמת הכל. הגוף זוכר. המוח זוכר. עכשיו תוכיח שזה לא מקרה — תעשה את זה שוב.',
    tone:  'gold',
  }

  // ── Time-of-day messages ──────────────────────────────────────────────────
  if (currentHour < 7) return {
    title: 'לפני שכולם קמו',
    body:  'בזמן שאחרים ישנים, אתה בונה. הנצחון של היום נקבע בשעה הזו. קדימה.',
    tone:  'gold',
  }
  if (currentHour >= 20) return {
    title: 'הערב הגיע — חשבון נפש',
    body:  'לפני שאתה נרגע: האם עשית את מה שהבטחת? התשובה שלך לשאלה הזו קובעת מי אתה.',
    tone:  'fire',
  }
  if (currentHour >= 14) return {
    title: 'אמצע היום — איפה אתה עומד?',
    body:  'כמה משימות עשית עד עכשיו? אל תתן ליום לברוח ממך. שעתיים טובות עכשיו שוות יותר מכוונות טובות.',
    tone:  'fire',
  }

  // ── Default morning ───────────────────────────────────────────────────────
  return {
    title: `יום ${dayCount} בתוכנית`,
    body:  'המנצחים לא מחכים למוטיבציה — הם מחליטים מה יקרה, ואז הם עושים את זה. תחליט עכשיו.',
    tone:  'gold',
  }
}
