export const MENU_EDGE = 8;
export const MENU_GAP = 4;

const ITEM_HEIGHT = 48;
const LIST_PADDING = 16;

type Field = { top: number; bottom: number };

export function menuPlacement(
  field: Field,
  viewport: number,
  items: number,
): { above: boolean; maxHeight: number } {
  const below = viewport - field.bottom - MENU_EDGE - MENU_GAP;
  const above = field.top - MENU_EDGE - MENU_GAP;
  const needed = items * ITEM_HEIGHT + LIST_PADDING;
  const useAbove = below < needed && above > below;
  return { above: useAbove, maxHeight: Math.max(useAbove ? above : below, 0) };
}
