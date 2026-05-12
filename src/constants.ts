// ─── Daily Motivational Quotes ───────────────────────────────────────────────
export const QUOTES: string[] = [
  'ההצלחה היא סכום של מאמצים קטנים שחוזרים על עצמם יום אחרי יום.',
  'אל תחכה לרגע המושלם. קח את הרגע ועשה אותו מושלם.',
  'כל מומחה היה פעם מתחיל. כל אלוף היה פעם חסר ניסיון.',
  'השינוי לא קורה בבת אחת. הוא קורה כל פעם שאתה בוחר אחרת.',
  'אנשים מצליחים עושים כל יום את מה שאנשים לא מצליחים מוכנים לעשות רק לפעמים.',
  'הגוף שלך מסוגל לכמעט הכל. המוח צריך לשכנע.',
  'קרא ספר. כל ספר שתקרא הוא שיחה עם אחד החכמים ביותר שאי פעם חיו.',
  'אתה לא מה שקרה לך — אתה מה שבחרת להיות.',
  'אימון אחד שדילגת עליו לא הרס אף אחד. אימונים שדילגת עליהם במשך שנים הרסו.',
  'הדרך הטובה ביותר לחזות את העתיד שלך — לבנות אותו.',
  'לא חסר לך מוטיבציה. חסרה לך בהירות לגבי מה שחשוב לך.',
  'ספרים הם אימון למוח. ספורט הוא אימון לגוף. שניהם בונים אתך.',
  'כל יום שאתה לומד משהו חדש — אתה גדול מאמש.',
  'המשמעת היא הגשר בין מטרות להישגים.',
  'הדבר הכי יקר שיש לך הוא הזמן. תשקיע אותו בחכמה.',
  'ניצחון על עצמך ביום אחד שווה יותר מניצחון על אחרים בחיים שלמים.',
  'קום מוקדם. עבוד קשה. חלום גדול. תן לתוצאות לדבר.',
  'הרגלים בונים זהות. זהות בונה עתיד.',
  'כל ספר שתפתח פותח לך דלת שלא ידעת שקיימת.',
  'מי שלומד כל יום — מתחרה רק בגרסה הישנה של עצמו.',
  'קביעות היא מה שמפריד בין חולמים לאנשים שמגשימים חלומות.',
  'תתמקד בתהליך — והתוצאות יבואו.',
  'אתה יכול לכעוס על כך שלוורד יש קוצים, או שמחת על כך שלקוץ יש ורד.',
  'יש רק דרך אחת להצליח: להמשיך לנסות.',
  'בכל בוקר שאתה קם — יש לך הזדמנות לכתוב פרק חדש.',
]

// ─── Daily Incantations ───────────────────────────────────────────────────────
export const INCANTATIONS: string[] = [
  'אני גדל כל יום. אני לומד כל יום. אני נותן כל יום.',
  'גופי חזק, מוחי חד, ליבי פתוח. אני מוכן להכל.',
  'אני לא מחכה לרגע הנכון — אני יוצר אותו.',
  'הכסף, הבריאות, הידע — הכל בא לי כי אני עובד עליהם בכל יום.',
  'פחד הוא רק עוד אתגר. ואתגרים הם ההזדמנות שלי לגדול.',
  'אני מוביל. אני משפיע. אני משאיר את העולם טוב יותר ממה שמצאתי.',
  'כל תא בגופי בריא, חזק, ומלא אנרגיה. אני נבנה מחדש כל בוקר.',
  'אני בן חורין. בן חורין מהפחדים, מהגבולות, מהתירוצים.',
  'אני הבורא של המציאות שלי — לא הקורבן שלה.',
  'ממשיך. תמיד. ללא פשרות על המטרות שלי.',
  'אני אוהב, נאהב, ומחובר. הקשרים שלי הם הכוח שלי.',
  'היום אני גרסה טובה יותר של עצמי מאמש.',
  'אני משקיע בעצמי כל יום — בגוף, בידע, ברוח.',
  'הגדולה שלי לא מגיעה מיום אחד — היא מגיעה מכל יום.',
]

// ─── Daily Habits (Actions) ───────────────────────────────────────────────────
export interface Habit {
  id:        string
  emoji:     string
  title:     string
  subtitle:  string
  category:  'production' | 'learning' | 'network' | 'discipline'
  timerSec?: number
}

export const HABITS: Habit[] = [
  // ── ייצור ────────────────────────────────────────────────────────────────
  { id: 'deepwork',  emoji: '🎯', title: 'עבודה עמוקה',         subtitle: '2+ שעות ללא הפרעות על הדבר שמקדם אותך הכי הרבה',  category: 'production', timerSec: 7200 },
  { id: 'content',   emoji: '✍️', title: 'יצירת תוכן',          subtitle: 'כתוב, הקלט, צור — משהו שאחרים יראו ויקבלו ערך',    category: 'production' },
  { id: 'revenue',   emoji: '💰', title: 'פעולה להכנסה',        subtitle: 'מכירה, הצעה מחיר, שיווק — פעולה שמכניסה כסף',      category: 'production' },

  // ── למידה ────────────────────────────────────────────────────────────────
  { id: 'read',      emoji: '📚', title: 'קריאת ספר',           subtitle: '20+ דקות — ספר שמלמד אותך משהו שימושי לחיים שלך',  category: 'learning',   timerSec: 1200 },
  { id: 'learn',     emoji: '🧠', title: 'למידה פעילה',         subtitle: 'קורס, פודקסט, מנטור — ידע חדש שמשפר אותך',         category: 'learning',   timerSec: 1800 },
  { id: 'goals',     emoji: '🔄', title: 'סקירת יעדים',         subtitle: 'בדוק את המטרות שלך — האם הפעולות שלך מכוונות אליהן?', category: 'learning', timerSec: 600  },

  // ── קשרים ────────────────────────────────────────────────────────────────
  { id: 'outreach',  emoji: '📞', title: 'נטוורקינג / אאוטריץ׳', subtitle: 'צור קשר עם מישהו שיכול לקדם אותך — שלח, התקשר, פגוש', category: 'network' },
  { id: 'give',      emoji: '🤝', title: 'נתינה / עזרה',        subtitle: 'עזור לאחד ללא תמורה — האנשים שנותנים מקבלים הכי הרבה', category: 'network' },

  // ── משמעת ────────────────────────────────────────────────────────────────
  { id: 'workout',   emoji: '💪', title: 'אימון גופני',          subtitle: 'גוף חזק = מוח חד = ביצועים גבוהים — אין תירוצים',   category: 'discipline' },
  { id: 'early',     emoji: '🌅', title: 'השכמה לפני 7',        subtitle: 'שעת הבוקר שייכת לך לבד — לפני שהעולם מתעורר',       category: 'discipline' },
  { id: 'noscroll',  emoji: '📵', title: 'שעה בלי מסכים',       subtitle: 'ללא סוציאל, ללא חדשות — מיקוד מלא על מה שחשוב',     category: 'discipline', timerSec: 3600 },
  { id: 'plan',      emoji: '📝', title: 'תכנון / יומן',         subtitle: '10 דקות — תכנן מחר ורשום מה למדת ומה תשנה',          category: 'discipline', timerSec: 600  },
]

// ─── Motivational Video Content ───────────────────────────────────────────────
export interface VideoCard {
  id:        string
  emoji:     string
  title:     string
  subtitle:  string
  speaker:   string
  duration:  string
  youtubeId?: string
  searchUrl?: string
  category:  string
}

export const VIDEO_CARDS: VideoCard[] = [
  {
    id: 'tr-ted',
    emoji: '🎤',
    title: 'למה אנחנו עושים מה שאנחנו עושים',
    subtitle: 'מה מניע אותנו באמת — וכיצד לשנות את הנהיגה הפנימית.',
    speaker: 'Tony Robbins',
    duration: '22 דק׳',
    youtubeId: 'Cpc-t-Uwv1I',
    category: 'MINDSET',
  },
  {
    id: 'goggins',
    emoji: '🔥',
    title: 'לא מספיק — לעולם לא מספיק',
    subtitle: 'David Goggins על משמעת פנימית, ריצה בלתי אפשרית, ואמת שכואבת.',
    speaker: 'David Goggins',
    duration: '5-10 דק׳',
    searchUrl: 'https://www.youtube.com/results?search_query=david+goggins+motivation+2024',
    category: 'DISCIPLINE',
  },
  {
    id: 'atomic',
    emoji: '📚',
    title: 'Atomic Habits — הרגלים שמשנים הכל',
    subtitle: 'James Clear מסביר איך שיפור של 1% ביום הופך לתוצאות בלתי ייאמנות.',
    speaker: 'James Clear',
    duration: '10-15 דק׳',
    searchUrl: 'https://www.youtube.com/results?search_query=james+clear+atomic+habits+talk',
    category: 'HABITS',
  },
  {
    id: 'jocko',
    emoji: '⚔️',
    title: 'Discipline Equals Freedom',
    subtitle: 'Jocko Willink — לשעבד Commander בחיל הנחתים — על משמעת כדרך חיים.',
    speaker: 'Jocko Willink',
    duration: '5-8 דק׳',
    searchUrl: 'https://www.youtube.com/results?search_query=jocko+willink+discipline+equals+freedom',
    category: 'DISCIPLINE',
  },
  {
    id: 'kobe',
    emoji: '🏀',
    title: 'Mamba Mentality',
    subtitle: 'Kobe Bryant על ה-Mamba Mentality — לאהוב את התהליך יותר מהתוצאה.',
    speaker: 'Kobe Bryant',
    duration: '3-5 דק׳',
    searchUrl: 'https://www.youtube.com/results?search_query=kobe+bryant+mamba+mentality+speech',
    category: 'MINDSET',
  },
  {
    id: 'ted-growth',
    emoji: '🧠',
    title: 'כוח ה-Mindset — לגדול לאורך כל החיים',
    subtitle: 'Carol Dweck על Growth Mindset — ההבדל בין אנשים שמגיעים לאן שרצו לבין אלו שלא.',
    speaker: 'Carol Dweck',
    duration: '10 דק׳',
    searchUrl: 'https://www.youtube.com/results?search_query=carol+dweck+growth+mindset+ted',
    category: 'MINDSET',
  },
]

// ─── Gratitude Prompts ────────────────────────────────────────────────────────
export const GRATITUDE_PROMPTS = [
  'מה בגופך, בחיים שלך, או בסביבתך שמיליוני אנשים חולמים עליו?',
  'מי אהב אותך ללא תנאים? תרגיש את האהבה הזאת עכשיו בחזה.',
  'מה הרגע בחייך שכשאתה חושב עליו — הפנים שלך מתעוותות לחיוך?',
]

// ─── Identity Archetypes ─────────────────────────────────────────────────────
export const IDENTITY_ARCHETYPES = [
  { emoji: '🦁', label: 'האריה',   desc: 'מוביל ללא פחד, מגן על מה שחשוב' },
  { emoji: '🔥', label: 'הלוחם',   desc: 'משמעת ברזל, עקשן ללא פשרות' },
  { emoji: '⚡', label: 'הבורא',   desc: 'מייצר, בונה, יוצר ערך לעולם' },
  { emoji: '🏔️', label: 'המנהיג',  desc: 'מעורר השראה, מרים אחרים' },
  { emoji: '💎', label: 'האמן',    desc: 'מצוינות בכל פרט, אין בינוניות' },
  { emoji: '🌊', label: 'הכוח',    desc: 'בלתי ניתן לעצירה, מגיע לכל מקום' },
]

// ─── Category colors ──────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  production: '#f5c435',
  learning:   '#3b82f6',
  network:    '#22c55e',
  discipline: '#ef4444',
  // video card categories
  MINDSET:    '#3b82f6',
  DISCIPLINE: '#ef4444',
  HABITS:     '#f5c435',
}

// ─── Daily Power Words ────────────────────────────────────────────────────────
export const POWER_WORDS = [
  'מיקוד', 'עוצמה', 'נצחון', 'כיבוש', 'בניה',
  'הקדשה', 'פריצה', 'שליטה', 'התקדמות', 'עומק',
  'קביעות', 'אומץ', 'משמעת', 'גדולה', 'פעולה',
  'בהירות', 'זרימה', 'כוח', 'מהירות', 'ביצוע',
]

export function getTodayPowerWord(): string {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000)
  return POWER_WORDS[d % POWER_WORDS.length]
}

// ─── Commander Rank ────────────────────────────────────────────────────────────
export function getCommanderRank(streak: number): { rank: string; emoji: string; color: string } {
  if (streak >= 30) return { rank: 'אלוף',   emoji: '⭐', color: '#f5c435' }
  if (streak >= 14) return { rank: 'מפקד',   emoji: '🎖️', color: '#f5c435' }
  if (streak >= 7)  return { rank: 'קצין',   emoji: '🏅', color: '#22c55e' }
  if (streak >= 3)  return { rank: 'לוחם',   emoji: '⚔️', color: '#3b82f6' }
  return                        { rank: 'טירון',  emoji: '🎯', color: '#ef4444' }
}

// ─── Rotation helpers ─────────────────────────────────────────────────────────
export function getTodayIncantation(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  return INCANTATIONS[dayOfYear % INCANTATIONS.length]
}

export function getTodayQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  return QUOTES[dayOfYear % QUOTES.length]
}
