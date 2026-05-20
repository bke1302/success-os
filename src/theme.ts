export type Theme = 'dark' | 'light'

export interface ThemeTokens {
  isDark:      boolean
  bg:          string   // main screen background
  bgRaised:    string   // footer/header bars
  card:        string   // card / list item background
  text:        string   // primary text
  textSub:     string   // secondary text
  textMuted:   string   // muted labels
  textDim:     string   // dim / placeholder
  textFaint:   string   // very faint / hints
  border:      string   // subtle border
  border2:     string   // stronger border
  divider:     string   // thin divider line
  tagBg:       string   // input / tag / pill background
  inputBorder: string   // input border
  surface:     string   // elevated surfaces (nav, overlays)
  cardShadow:  string   // card box-shadow
  accent:      string   // primary accent color (#5B8CFF)
}

export const darkTokens: ThemeTokens = {
  isDark:      true,
  bg:          '#0E0F13',
  bgRaised:    '#151821',
  card:        '#1A1C22',
  text:        '#F8FAFC',
  textSub:     '#94A3B8',
  textMuted:   '#64748B',
  textDim:     '#475569',
  textFaint:   '#334155',
  border:      'rgba(255,255,255,.06)',
  border2:     'rgba(255,255,255,.12)',
  divider:     'rgba(255,255,255,.04)',
  tagBg:       'rgba(255,255,255,.04)',
  inputBorder: 'rgba(255,255,255,.10)',
  surface:     'rgba(10,11,16,.97)',
  cardShadow:  '0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.2)',
  accent:      '#5B8CFF',
}

export const lightTokens: ThemeTokens = {
  isDark:      false,
  bg:          '#F8FAFC',
  bgRaised:    '#FFFFFF',
  card:        '#FFFFFF',
  text:        '#0F172A',
  textSub:     '#334155',
  textMuted:   '#64748B',
  textDim:     '#94A3B8',
  textFaint:   '#CBD5E1',
  border:      'rgba(0,0,0,.07)',
  border2:     'rgba(0,0,0,.13)',
  divider:     'rgba(0,0,0,.05)',
  tagBg:       'rgba(0,0,0,.04)',
  inputBorder: 'rgba(0,0,0,.14)',
  surface:     'rgba(255,255,255,.97)',
  cardShadow:  '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)',
  accent:      '#3B6FEF',
}
