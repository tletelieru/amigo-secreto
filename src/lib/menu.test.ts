import { describe, expect, it } from 'vitest';
import { MENU_EDGE, MENU_GAP, menuPlacement } from './menu';

const room = MENU_EDGE + MENU_GAP;

describe('menuPlacement', () => {
  it('opens below when the options fit', () => {
    expect(menuPlacement({ top: 100, bottom: 150 }, 800, 5)).toEqual({
      above: false,
      maxHeight: 800 - 150 - room,
    });
  });

  it('opens above when they only fit there', () => {
    expect(menuPlacement({ top: 600, bottom: 650 }, 800, 5)).toEqual({
      above: true,
      maxHeight: 600 - room,
    });
  });

  it('uses the larger side and limits the height when neither fits', () => {
    expect(menuPlacement({ top: 180, bottom: 230 }, 400, 8)).toEqual({
      above: true,
      maxHeight: 180 - room,
    });
    expect(menuPlacement({ top: 130, bottom: 180 }, 400, 8)).toEqual({
      above: false,
      maxHeight: 400 - 180 - room,
    });
  });

  it('never returns a negative height', () => {
    expect(menuPlacement({ top: -50, bottom: 900 }, 800, 5).maxHeight).toBe(0);
  });
});
