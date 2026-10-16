import { ChevronLeft, ChevronRight } from 'lucide-react';

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
