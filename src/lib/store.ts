import { emptyGroup, isGroup } from './group';
import type { Group } from './group';
import { load, save } from './storage';

export type GroupStore = {
  load: () => Group;
  save: (group: Group) => void;
};

const groupKey = 'as-group';

export const localGroupStore: GroupStore = {
  load: () => load(groupKey, isGroup, emptyGroup()),
  save: (group) => save(groupKey, group),
};
