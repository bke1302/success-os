export type Theme = 'dark' | 'light'

export interface ThemeTokens {
  isDark:      boolean
  bg:          string   // main screen background
  bgRaised:    string   // footer/header bars
  text:        string   // primary text
  textSub:     string   // slightly muted (55-60% opacity)
  textMuted:   string   // muted labels / secondary info
  textDim:     string   // dim / placeholder
  textFaint:   string   // very faint / hints
  border:      string   // subtle border
  border2:     string   // stronger border
  divider:     string   // thin divider line
  tagBg:       string   // input / tag / pill background
  inputBorder: string   // input border
  surface:     string   // elevated surfaces (nav, overlays)
  cardShadow:  string   // card box-shadow override for .card class
}

export const darkTokens: ThemeTokens = {
  isDark:      true,
  bg:          '#0D0E13',
  bgRaised:    '#12141A',
  text:        '#f2f2f7',
  textSub:     'rgba(255,255,255,.60)',
  textMuted:   'rgba(255,255,255,.40)',
  textDim:     'rgba(255,255,255,.26)',
  textFaint:   'rgba(255,255,255,.15)',
  border:      'rgba(255,255,255,.09)',
  border2:     'rgba(255,255,255,.16)',
  divider:     'rgba(255,255,255,.07)',
  tagBg:       'rgba(255,255,255,.05)',
  inputBorder: 'rgba(255,255,255,.13)',
  surface:     'rgba(8,8,8,.97)',
  cardShadow:  '0 2px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)',
}

export const lightTokens: ThemeTokens = {
  isDark:      false,
  bg:          '#F0EFE9',
  bgRaised:    '#FFFFFF',
  text:        '#0D0D0D',
  textSub:     'rgba(0,0,0,.70)',
  textMuted:   'rgba(0,0,0,.50)',
  textDim:     'rgba(0,0,0,.50)',
  textFaint:   'rgba(0,0,0,.35)',
  border:      'rgba(0,0,0,.09)',
  border2:     'rgba(0,0,0,.18)',
  divider:     'rgba(0,0,0,.08)',
  tagBg:       'rgba(0,0,0,.05)',
  inputBorder: 'rgba(0,0,0,.18)',
  surface:     'rgba(255,255,255,.97)',
  cardShadow:  '0 2px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.05)',
}
