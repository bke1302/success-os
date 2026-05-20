import { useTheme } from '../contexts/ThemeContext'

interface Props {
  daysMissed: number
  onContinue: () => void
}

const MESSAGES = [
  'הנופל אינו מי שנופל — אלא מי שנשאר למטה.',
  'כל אלוף חזר אחרי נפילה. השאלה היא רק מתי.',
  'החזרה תמיד קשה יותר מהמשך. ולכן היא שווה יותר.',
  'המוח שלך זוכר כל יום שסיימת. הוא מחכה לך.',
]

export function ComebackScreen({ daysMissed, onContinue }: Props) {
  const T = useTheme()
  const msg = MESSAGES[daysMissed % MESSAGES.length]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: T.isDark
        ? 'linear-gradient(180deg, #0d0e13 0%, #111318 100%)'
        : 'linear-gradient(180deg, #f0f4ff 0%, #e8eeff 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
          background: 'rgba(255,55,95,.1)', border: '2px solid rgba(255,55,95,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          🔥
        </div>

        {/* Days missed */}
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700,
          letterSpacing: '3px', color: 'rgba(255,55,95,.7)', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {daysMissed} {daysMissed === 1 ? 'יום' : 'ימים'} של היעדרות
        </p>

        <h1 dir="rtl" style={{
          fontFamily: '"Frank Ruhl Libre", Georgia, serif',
          fontSize: '2rem', fontWeight: 900, color: T.text,
          lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 20,
        }}>
          ברוך השב.<br />הדרך עדיין כאן.
        </h1>

        <p dir="rtl" style={{
          fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400,
          color: T.textMuted, lineHeight: 1.7, marginBottom: 40, fontStyle: 'italic',
        }}>
          "{msg}"
        </p>

        <button onClick={onContinue}
          dir="rtl"
          style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #FF375F, #FF6B35)',
            border: 'none', borderRadius: 16, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 900,
            color: '#fff', letterSpacing: '-.3px',
            boxShadow: '0 8px 24px rgba(255,55,95,.35)',
          }}>
          אני חוזר — בואו נעשה זאת
        </button>

        <p dir="rtl" style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textFaint,
          marginTop: 16, lineHeight: 1.5,
        }}>
          הסטריק נשבר — אבל ה-{daysMissed === 1 ? 'יום' : 'ימים'} שבנית לא נמחקו
        </p>
      </div>
    </div>
  )
}
