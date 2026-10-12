// A titled section of a page; its heading is its accessible name.
import type { ComponentChildren } from 'preact';

export interface PanelProps {
  id?: string;
  class?: string;
  titleId: string;
  title: ComponentChildren;
  titleClass?: string;
  children?: ComponentChildren;
}

export function Panel(p: PanelProps) {
  return (
    <section id={p.id} class={p.class} aria-labelledby={p.titleId}>
      <h2 id={p.titleId} class={p.titleClass}>{p.title}</h2>
      {p.children}
    </section>
  );
}
