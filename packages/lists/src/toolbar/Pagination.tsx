import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { ListResponse } from '@panneau/protocol';
import { isCursorPage } from '@panneau/protocol/runtime';
import { IconButton, Select, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import styles from './Toolbar.module.css';

export interface PaginationProps {
    page: number;
    perPage: number;
    /** How many items match the query, on every page. */
    total: number;
    onPageChange: (page: number) => void;
    /** Page sizes to choose from. Without them, the page size can't be changed. */
    perPageOptions?: readonly number[] | undefined;
    onPerPageChange?: (perPage: number) => void;
}

/** The range of items shown, the page, and buttons to the previous and next pages. */
export function Pagination({
    page,
    perPage,
    total,
    onPageChange,
    perPageOptions = [],
    onPerPageChange,
}: PaginationProps) {
    const intl = usePanneauIntl();
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(total, page * perPage);
    const sizes = [...new Set([...perPageOptions, perPage])].sort((a, b) => a - b);
    return (
        <nav aria-label={intl.formatMessage(messages.pagination)} className={styles.pagination}>
            <span>{intl.formatMessage(messages.range, { start, end, total })}</span>
            <div className={styles.pages}>
                {perPageOptions.length > 0 && onPerPageChange !== undefined ? (
                    <Select
                        aria-label={intl.formatMessage(messages.perPage)}
                        options={sizes.map((size) => ({ value: size, label: String(size) }))}
                        value={perPage}
                        onChange={(value) => {
                            if (typeof value === 'number') {
                                onPerPageChange(value);
                            }
                        }}
                        className={styles.perPage}
                    />
                ) : null}
                <IconButton
                    icon={ChevronLeft}
                    label={intl.formatMessage(messages.previousPage)}
                    isDisabled={page <= 1}
                    onPress={() => onPageChange(page - 1)}
                />
                <span aria-current="page">
                    {intl.formatMessage(messages.pageOf, { page, lastPage })}
                </span>
                <IconButton
                    icon={ChevronRight}
                    label={intl.formatMessage(messages.nextPage)}
                    isDisabled={page >= lastPage}
                    onPress={() => onPageChange(page + 1)}
                />
            </div>
        </nav>
    );
}

export interface CursorPaginationProps {
    perPage: number;
    /** Whether there is a page before: the list isn't on its first page. */
    hasPrevious: boolean;
    /** Whether there is a page after: the page has a `nextCursor`. */
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    /** Page sizes to choose from. Without them, the page size can't be changed. */
    perPageOptions?: readonly number[] | undefined;
    onPerPageChange?: (perPage: number) => void;
}

/**
 * Buttons to the previous and next pages of a list paged with cursors, which has no page numbers
 * and no total (decision 0039).
 */
export function CursorPagination({
    perPage,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    perPageOptions = [],
    onPerPageChange,
}: CursorPaginationProps) {
    const intl = usePanneauIntl();
    const sizes = [...new Set([...perPageOptions, perPage])].sort((a, b) => a - b);
    return (
        <nav aria-label={intl.formatMessage(messages.pagination)} className={styles.pagination}>
            <span />
            <div className={styles.pages}>
                {perPageOptions.length > 0 && onPerPageChange !== undefined ? (
                    <Select
                        aria-label={intl.formatMessage(messages.perPage)}
                        options={sizes.map((size) => ({ value: size, label: String(size) }))}
                        value={perPage}
                        onChange={(value) => {
                            if (typeof value === 'number') {
                                onPerPageChange(value);
                            }
                        }}
                        className={styles.perPage}
                    />
                ) : null}
                <IconButton
                    icon={ChevronLeft}
                    label={intl.formatMessage(messages.previousPage)}
                    isDisabled={!hasPrevious}
                    onPress={onPrevious}
                />
                <IconButton
                    icon={ChevronRight}
                    label={intl.formatMessage(messages.nextPage)}
                    isDisabled={!hasNext}
                    onPress={onNext}
                />
            </div>
        </nav>
    );
}

/**
 * The props of a `ListView` that page it, from the `meta` of a page of the list: `total` for
 * numbered pages, `cursors` for a list paged with cursors.
 *
 * ```tsx
 * <ListView {...getPagingProps(data?.meta)} items={data?.data} … />
 * ```
 */
export function getPagingProps(meta: ListResponse['meta'] | undefined): {
    total?: number;
    cursors?: { next: string | null; previous?: string | null };
} {
    if (meta === undefined) {
        return {};
    }
    if (isCursorPage(meta)) {
        return {
            cursors: {
                next: meta.nextCursor,
                ...(meta.previousCursor !== undefined ? { previous: meta.previousCursor } : {}),
            },
        };
    }
    return { total: meta.total };
}
