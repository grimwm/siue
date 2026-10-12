import { add } from './pure.ts';
import { show } from './view.tsx';
declare const NOTE_V: string;
show(document.body, add(1, 2));
export const noteVersion = NOTE_V;
