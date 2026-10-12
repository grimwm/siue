import { render } from 'preact';
export function show(root: HTMLElement, n: number): void { render(<p>{n}</p>, root); }
