// websites/www.cs/games/_kit/ui/share-icon.tsx
// The Share icon, drawn once for the whole site: an arrow up out of a tray.
// The kit's install bar, its iOS steps and Tankity's title card all use it.

export interface ShareIconProps {
  /** Width and height in px. */
  size?: number;
  class?: string;
}

export function ShareIcon(p: ShareIconProps) {
  const size = p.size ?? 18;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false" class={p.class}>
      <path d="M12 15V3M7 8l5-5 5 5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
