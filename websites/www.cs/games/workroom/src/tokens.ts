// The colour tokens' values as src/app.css defines them, for the code that
// computes with colours (contrast). test/tokens.test.ts fails when the two
// differ. DOM-free.
export type Theme = 'dark' | 'light';
export const TOKEN_NAMES = ['ground', 'panel', 'well', 'lane', 'rule', 'ink', 'dim', 'amber', 'go', 'record', 'on-accent', 'paper'] as const;
export type Token = (typeof TOKEN_NAMES)[number];

export const TOKENS: Readonly<Record<Theme, Readonly<Record<Token, string>>>> = {
  dark: {
    ground: '#121519', panel: '#1b1f25', well: '#0d0f12', lane: '#161a20', rule: '#2a3039', ink: '#e8eaee',
    dim: '#9aa3b0', amber: '#f5b942', go: '#3ddc84', record: '#e2574c', 'on-accent': '#121519', paper: '#ffffff',
  },
  light: {
    ground: '#eef0f3', panel: '#ffffff', well: '#f7f8fa', lane: '#e8ebef', rule: '#cfd5dd', ink: '#15191f',
    dim: '#55606d', amber: '#8f5d00', go: '#1a7f47', record: '#b8322a', 'on-accent': '#ffffff', paper: '#ffffff',
  },
};
