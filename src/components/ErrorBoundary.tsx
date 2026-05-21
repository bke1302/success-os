import { Component, type ReactNode } from 'react'

interface State { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        height: '100dvh', background: '#0E0F13',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 36px', gap: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: 52 }}>⚠️</div>
        <h2 dir="rtl" style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: '2rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>
          משהו השתבש
        </h2>
        <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, margin: 0 }}>
          הנתונים שלך בטוחים — רענן את העמוד לחזור
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px 32px',
            background: 'rgba(255,214,10,.1)', border: '1px solid rgba(255,214,10,.3)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#FFD60A',
          }}
          dir="rtl">
          רענן עמוד
        </button>
      </div>
    )
  }
}
