export function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
      animation: 'splashOut .4s ease-in 1.1s both',
    }}>
      <style>{`
        @keyframes splashOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashSubIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: .38; transform: translateY(0); }
        }
      `}</style>

      {/* Logo mark */}
      <div style={{
        animation: 'splashLogoIn .5s cubic-bezier(.16,1,.3,1) .1s both',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          border: '1.5px solid rgba(255,214,10,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: '2.6rem', fontWeight: 900,
            color: '#FFD60A', lineHeight: 1,
            letterSpacing: '-2px',
          }}>S</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 13, fontWeight: 800, letterSpacing: '4px',
            color: '#ffffff', textTransform: 'uppercase',
          }}>SUCCESS OS</p>
        </div>
      </div>

      <p style={{
        position: 'absolute', bottom: 48,
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 9, fontWeight: 700, letterSpacing: '2.5px',
        color: 'rgba(255,255,255,.22)', textTransform: 'uppercase',
        animation: 'splashSubIn .4s ease .4s both',
      }}>מערכת ההפעלה של הגדולה</p>
    </div>
  )
}
