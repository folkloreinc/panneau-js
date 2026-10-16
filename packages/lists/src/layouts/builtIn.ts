import type { ListLayoutEntry } from '../types';
import { CardsLayout } from './CardsLayout';
import { TableLayout } from './TableLayout';

/** The built-in list layouts, by id. `gallery` and `calendar` come later. */
export const builtInLayouts: Readonly<Record<string, ListLayoutEntry>> & {
    table: ListLayoutEntry;
} = {
    table: TableLayout,
    cards: CardsLayout,
};
