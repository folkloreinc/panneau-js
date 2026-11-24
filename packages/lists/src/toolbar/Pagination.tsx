import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ListResponse } from '@panneau/protocol';
import { isCursorPage } from '@panneau/protocol/runtime';
import { Button, IconButton, Select, TextInput, Tooltip, usePanneauIntl } from '@panneau/ui';

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

/** The page typed in "Go to page", within the pages, or `null` when it isn't a number. */
export function toPage(text: string, lastPage: number): number | null {
    const page = Number.parseInt(text.replace(/\D/g, ''), 10);
    return Number.isNaN(page) ? null : Math.min(lastPage, Math.max(1, page));
}

/**
 * The current page, as a button that opens a small "Go to page" input in its place: Enter goes to
 * the page typed (within the pages), Escape or leaving the input closes it. The focus comes back
 * to the button.
 */
function CurrentPage({
    page,
    lastPage,
    onPageChange,
}: {
    page: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}) {
    const intl = usePanneauIntl();
    const [isEditing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const wrapper = useRef<HTMLSpanElement>(null);
    const returnFocus = useRef(false);
    useEffect(() => {
        if (!isEditing && returnFocus.current) {
            returnFocus.current = false;
            wrapper.current?.querySelector('button')?.focus();
        }
    }, [isEditing]);
    const label = intl.formatMessage(messages.pageOf, { page, lastPage });
    const close = (focus: boolean) => {
        returnFocus.current = focus;
        setEditing(false);
    };
    if (lastPage <= 1) {
        return <span aria-current="page">{label}</span>;
    }
    return (
        <span ref={wrapper} aria-current="page" className={styles.currentPage}>
            {isEditing ? (
                <TextInput
                    aria-label={intl.formatMessage(messages.goToPage)}
                    inputMode="numeric"
                    autoComplete="off"
                    // The user just asked for it: the page shown, selected, to type over
                    autoFocus
                    onFocus={(event) => {
                        if (event.target instanceof HTMLInputElement) {
                            event.target.select();
                        }
                    }}
                    value={draft}
                    onChange={setDraft}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            const next = toPage(draft, lastPage);
                            if (next !== null && next !== page) {
                                onPageChange(next);
                            }
                            close(true);
                        } else if (event.key === 'Escape') {
                            // Closes the input, not a dialog or a panel around the list
                            event.stopPropagation();
                            close(true);
                        }
                    }}
                    onBlur={() => close(false)}
                    suffix={
                        <span className={styles.lastPage}>
                            {intl.formatMessage(messages.ofLastPage, { lastPage })}
                        </span>
                    }
                    className={styles.goToPage}
                />
            ) : (
                <Tooltip content={intl.formatMessage(messages.goToPage)}>
                    <Button
                        appearance="ghost"
                        size="sm"
                        className={styles.pageButton}
                        onPress={() => {
                            setDraft(String(page));
                            setEditing(true);
                        }}
                    >
                        {label}
                    </Button>
                </Tooltip>
            )}
        </span>
    );
}

/**
 * The range of items shown, the page, and buttons to the first, previous, next and last pages.
 * The current page opens a "Go to page" input, to jump far.
 */
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
                <span className={styles.pageButtons}>
                    <IconButton
                        icon={ChevronsLeft}
                        label={intl.formatMessage(messages.firstPage)}
                        isDisabled={page <= 1}
                        onPress={() => onPageChange(1)}
                    />
                    <IconButton
                        icon={ChevronLeft}
                        label={intl.formatMessage(messages.previousPage)}
                        isDisabled={page <= 1}
                        onPress={() => onPageChange(page - 1)}
                    />
                    <CurrentPage page={page} lastPage={lastPage} onPageChange={onPageChange} />
                    <IconButton
                        icon={ChevronRight}
                        label={intl.formatMessage(messages.nextPage)}
                        isDisabled={page >= lastPage}
                        onPress={() => onPageChange(page + 1)}
                    />
                    <IconButton
                        icon={ChevronsRight}
                        label={intl.formatMessage(messages.lastPage)}
                        isDisabled={page >= lastPage}
                        onPress={() => onPageChange(lastPage)}
                    />
                </span>
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
