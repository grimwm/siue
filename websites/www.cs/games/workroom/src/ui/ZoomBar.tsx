// The zoom buttons over a view: Zoom Out (−), Zoom In (+) and Fit. They sit in
// a row of their own that is always there, so zooming never moves the page.
import { Button } from './console/Button.tsx';

export interface ZoomBarProps { onOut(): void; onIn(): void; onFit(): void; canOut: boolean; canIn: boolean; atFit: boolean }

export function ZoomBar(p: ZoomBarProps) {
  return (
    <div class="zoom-bar flex items-center gap-1 print:hidden" role="group" aria-label="Zoom" data-zoom-bar="">
      <Button variant="ghost" label="Zoom Out" disabled={!p.canOut} onClick={p.onOut} data={{ 'data-zoom': 'out' }}><span aria-hidden="true" class="text-lg leading-none">−</span></Button>
      <Button variant="ghost" label="Zoom In" disabled={!p.canIn} onClick={p.onIn} data={{ 'data-zoom': 'in' }}><span aria-hidden="true" class="text-lg leading-none">+</span></Button>
      <Button variant="ghost" disabled={p.atFit} onClick={p.onFit} data={{ 'data-zoom': 'fit' }}>Fit</Button>
    </div>
  );
}
