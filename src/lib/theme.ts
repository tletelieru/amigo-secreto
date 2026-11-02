import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export type ColorMode = 'light' | 'dark';

export const colorModeKey = 'color-mode';

const FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const DISPLAY = 'Fraunces, Georgia, "Times New Roman", serif';

export function pickColorMode(saved: string | null, prefersDark: boolean): ColorMode {
  if (saved === 'light' || saved === 'dark') return saved;
  return prefersDark ? 'dark' : 'light';
}

export function createAppTheme(mode: ColorMode): Theme {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#f2b84b' : '#c8352b' },
      secondary: { main: dark ? '#7fc8a0' : '#1f6b4f' },
      background: dark
        ? { default: '#10201b', paper: '#172c25' }
        : { default: '#fbf6ec', paper: '#fffdf8' },
      divider: dark ? 'rgba(255,255,255,0.12)' : 'rgba(31,50,42,0.14)',
      text: dark
        ? { primary: '#f6f1e6', secondary: '#b3c0b8' }
        : { primary: '#1c2a24', secondary: '#55635c' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: FONT,
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h3: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${dark ? 'rgba(255,255,255,0.22)' : 'rgba(23,24,28,0.22)'} transparent`,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } },
      },
      MuiCard: { styleOverrides: { root: { borderRadius: 18 } } },
    },
  });
}
