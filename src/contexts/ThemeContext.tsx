import { createContext, useContext } from 'react'
import { darkTokens, type ThemeTokens } from '../theme'

export const ThemeContext = createContext<ThemeTokens>(darkTokens)
export const useTheme = () => useContext(ThemeContext)
