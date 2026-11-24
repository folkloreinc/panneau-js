import { Suspense, lazy } from 'react';

import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListLayoutEntry, ListLayoutProps } from '../types';
import { CardsLayout } from './CardsLayout';
import { GalleryLayout } from './GalleryLayout';
import { TableLayout } from './TableLayout';

const LoadedCalendarLayout = lazy(async () => ({
    default: (await import('./CalendarLayout')).CalendarLayout,
}));

/**
 * The calendar, loaded when a list shows it: few lists have one, and the first page of an app
 * doesn't need its code. A skeleton of its grid shows while it loads.
 */
function CalendarLayout(props: ListLayoutProps) {
    const intl = usePanneauIntl();
    return (
        <Suspense
            fallback={
                <LoadingRegion label={intl.formatMessage(messages.loading)}>
                    <Skeleton shape="rect" height="30rem" />
                </LoadingRegion>
            }
        >
            <LoadedCalendarLayout {...props} />
        </Suspense>
    );
}

/** The built-in list layouts, by id (decision 0044). */
export const builtInLayouts: Readonly<Record<string, ListLayoutEntry>> & {
    table: ListLayoutEntry;
} = {
    table: TableLayout,
    cards: CardsLayout,
    gallery: GalleryLayout,
    calendar: CalendarLayout,
};
