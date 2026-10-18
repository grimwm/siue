// The theme the views draw for, so score colours can be made readable on it.
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Theme } from '../tokens.ts';

export const ThemeContext = createContext<Theme>('dark');
export const useTheme = (): Theme => useContext(ThemeContext);
