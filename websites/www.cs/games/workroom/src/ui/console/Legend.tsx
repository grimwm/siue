// One line under a view saying how to read it.
export function Legend(p: { items: readonly string[] }) {
  return <p data-legend="" class="font-mono text-xs text-dim">{p.items.join(' · ')}</p>;
}
