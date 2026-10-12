// One key, as the player presses it. The game styles .key-chip and passes the
// label from its key table, so a chip can never disagree with the binding.
export interface KeyChipProps {
  label: string;
  class?: string;
  /** The key-table slot it shows ("global:new"), written as data-keyhint. */
  at?: string;
  /** Beside words that already name the action: hidden from screen readers. */
  decorative?: boolean;
}

export function KeyChip({ label, class: cls, at, decorative }: KeyChipProps) {
  return <kbd class={cls ?? 'key-chip'} data-keyhint={at} aria-hidden={decorative ? 'true' : undefined}>{label}</kbd>;
}
