// One key, as the player presses it. The kit styles .kit-key-chip and .kit-key-tab (_kit/kit.css, opt-in) and the
// game passes the label from its key table, so a chip can never disagree with the binding.
export interface KeyChipProps {
  label: string;
  /** A chip's class replaces the kit's; a tab's is added after the kit's, so the kit's properties still drive it. */
  class?: string;
  /** The key-table slot it shows ("global:new"), written as data-keyhint. */
  at?: string;
  /** Beside words that already name the action: hidden from screen readers. */
  decorative?: boolean;
  /** 'chip' (default): an inline keycap. 'tab': a small label pinned to the top corner of its button, which must be positioned. */
  variant?: 'chip' | 'tab';
}

export function KeyChip({ label, class: cls, at, decorative, variant }: KeyChipProps) {
  const className = variant === 'tab' ? (cls ? `kit-key-tab ${cls}` : 'kit-key-tab') : (cls ?? 'kit-key-chip');
  return <kbd class={className} data-keyhint={at} aria-hidden={decorative ? 'true' : undefined}>{label}</kbd>;
}
