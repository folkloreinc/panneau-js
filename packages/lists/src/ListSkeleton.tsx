import type { ReactNode } from 'react';

import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import { messages } from './messages';
import type { ListColumn, ListItem, ListLayoutEntry } from './types';

/** The most rows a skeleton draws: about what fits in a window. */
const MAX_ROWS = 10;
/** Widths of the values, varied so the rows read as text. */
const WIDTHS = ['72%', '48%', '64%', '40%', '56%', '80%'];

const none = () => null;
const nothing = () => undefined;

export interface ListSkeletonProps {
    Layout: ListLayoutEntry;
    columns: readonly ListColumn[];
    /** The page size: as many rows, up to what fits. */
    perPage: number | undefined;
    sort: readonly string[];
    label: string;
}

/**
 * The first page of a list that loads (decision 0034): the list's own layout, with its columns
 * and a skeleton for each value, as many rows as the page size, up to what fits. The layout is
 * inert and hidden: its headers can't be used before the items are there, and the status message
 * of the region says that the list loads.
 */
export function ListSkeleton({ Layout, columns, perPage, sort, label }: ListSkeletonProps) {
    const intl = usePanneauIntl();
    const rows = Math.max(1, Math.min(perPage ?? MAX_ROWS, MAX_ROWS));
    const items: ListItem[] = Array.from({ length: rows }, (_, index) => ({
        id: `skeleton-${String(index)}`,
    }));
    const renderValue = (item: ListItem, column: ListColumn): ReactNode => {
        const offset = items.indexOf(item) + columns.indexOf(column);
        return <Skeleton width={WIDTHS[offset % WIDTHS.length]} />;
    };
    return (
        <LoadingRegion label={intl.formatMessage(messages.loading)}>
            <div inert aria-hidden="true">
                <Layout
                    items={items}
                    columns={columns}
                    renderValue={renderValue}
                    getItemLabel={(item) => item.id}
                    getItemHref={none}
                    isCurrent={() => false}
                    selectable={false}
                    isSelected={() => false}
                    onToggle={nothing}
                    renderActions={none}
                    sort={sort}
                    onSort={nothing}
                    label={label}
                    pageSelection={null}
                />
            </div>
        </LoadingRegion>
    );
}
