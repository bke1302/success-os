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
  bg:          '#000000',
  bgRaised:    '#000000',
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
  bg:          '#F5F4F0',
  bgRaised:    '#FFFFFF',
  text:        '#0D0D0D',
  textSub:     'rgba(0,0,0,.65)',
  textMuted:   'rgba(0,0,0,.50)',
  textDim:     'rgba(0,0,0,.36)',
  textFaint:   'rgba(0,0,0,.22)',
  border:      'rgba(0,0,0,.08)',
  border2:     'rgba(0,0,0,.15)',
  divider:     'rgba(0,0,0,.07)',
  tagBg:       'rgba(0,0,0,.04)',
  inputBorder: 'rgba(0,0,0,.12)',
  surface:     'rgba(250,249,245,.97)',
  cardShadow:  '0 2px 20px rgba(0,0,0,.06), 0 1px 6px rgba(0,0,0,.04)',
}
