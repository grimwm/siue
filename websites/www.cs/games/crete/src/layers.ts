/* The Island of Crete: the cards that can be open over the maze, as a stack.
 * Only the top one is shown. Q takes the top one away; with nothing open it
 * opens the menu; the title card ignores it here (src/ui.ts opens the menu
 * from it). The level editor is a layer too: src/ui.ts hands it every key
 * while it is the top one. A shared level's card is one as well (src/ui.ts
 * takes its Q to the title card). DOM-free. */
export type LayerName = "title" | "menu" | "story" | "chapter" | "lore" | "levels" | "start" | "end" | "editor" | "shared";
/** What a Q press did: closed the top card, opened the menu, or left the title card be. */
export type BackResult = "closed" | "opened" | "kept";

export interface Layers {
  top(): LayerName | null;
  /** True when `name` is the top card: the one a dialog shows. */
  isOpen(name: LayerName): boolean;
  /** True when `name` is anywhere in the stack. */
  has(name: LayerName): boolean;
  any(): boolean;
  /** Puts `name` on top (once). */
  open(name: LayerName): void;
  close(name: LayerName): void;
  clear(): void;
  pressBack(): BackResult;
}

export function createLayers(onChange: () => void): Layers {
  let stack: LayerName[] = [];
  const set = (next: LayerName[]): void => {
    stack = next;
    onChange();
  };
  const top = (): LayerName | null => stack[stack.length - 1] ?? null;
  return {
    top,
    isOpen: (name) => top() === name,
    has: (name) => stack.includes(name),
    any: () => stack.length > 0,
    open: (name) => set([...stack.filter((n) => n !== name), name]),
    close: (name) => {
      if (stack.includes(name)) set(stack.filter((n) => n !== name));
    },
    clear: () => {
      if (stack.length > 0) set([]);
    },
    pressBack() {
      const current = top();
      if (current === "title") return "kept";
      if (current === null) {
        set(["menu"]);
        return "opened";
      }
      set(stack.slice(0, -1));
      return "closed";
    },
  };
}
