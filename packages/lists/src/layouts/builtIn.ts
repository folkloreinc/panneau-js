import type { ListLayoutEntry } from '../types';
import { CalendarLayout } from './CalendarLayout';
import { CardsLayout } from './CardsLayout';
import { GalleryLayout } from './GalleryLayout';
import { TableLayout } from './TableLayout';

/** The built-in list layouts, by id (decision 0044). */
export const builtInLayouts: Readonly<Record<string, ListLayoutEntry>> & {
    table: ListLayoutEntry;
} = {
    table: TableLayout,
    cards: CardsLayout,
    gallery: GalleryLayout,
    calendar: CalendarLayout,
};
