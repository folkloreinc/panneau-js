import { ListFilter, SlidersHorizontal } from 'lucide-react';

import type { Filter } from '@panneau/protocol';
import {
    Badge,
    Button,
    Dialog,
    DialogTrigger,
    Popover,
    PopoverTrigger,
    usePanneauIntl,
} from '@panneau/ui';

import { messages } from '../messages';
import { FilterControls, type FilterControlsProps, isFilterActive } from './Filters';
import styles from './Filters.module.css';

/** How many filters show first, when none of them says it does (`primary`). */
export const DEFAULT_PRIMARY_FILTERS = 3;

/**
 * The filters shown first, and those behind "More filters". The filters with `primary: true`
 * show first; without any, the first 3 do. A filter with `primary: false` is always behind.
 */
export function splitFilters(filters: readonly Filter[]): {
    primary: Filter[];
    secondary: Filter[];
} {
    const chosen = filters.some((filter) => filter.primary === true);
    const primary: Filter[] = [];
    const secondary: Filter[] = [];
    for (const filter of filters) {
        const isPrimary = filter.primary ?? (!chosen && primary.length < DEFAULT_PRIMARY_FILTERS);
        (isPrimary ? primary : secondary).push(filter);
    }
    return { primary, secondary };
}

/** A button label with the count of the active filters behind it. */
function CountedLabel({ label, count }: { label: string; count: number }) {
    const intl = usePanneauIntl();
    return (
        <>
            {label}
            {count > 0 ? ' ' : null}
            {count > 0 ? (
                <Badge
                    tone="accent"
                    appearance="solid"
                    label={intl.formatMessage(messages.activeFilterCount, { count })}
                    className={styles.count}
                >
                    {count}
                </Badge>
            ) : null}
        </>
    );
}

export type FilterBarProps = Omit<FilterControlsProps, 'stacked' | 'aria-label'>;

/**
 * The filters of a list's toolbar: those shown first, as chips with their label inside (#519), and
 * the others behind "More filters", with the count of those that are active. In a narrow list (a phone), every filter is behind one
 * "Filters" button, with the count of the active ones, which opens them in a sheet. The values of
 * every active filter stay visible as chips, under the toolbar.
 */
export function FilterBar(props: FilterBarProps) {
    const intl = usePanneauIntl();
    const { filters, values, onChange } = props;
    const { primary, secondary } = splitFilters(filters);
    const activeCount = filters.filter((filter) => isFilterActive(values, filter)).length;
    const secondaryCount = secondary.filter((filter) => isFilterActive(values, filter)).length;
    const moreLabel = intl.formatMessage(messages.moreFilters);
    const filtersLabel = intl.formatMessage(messages.filters);
    return (
        <>
            <div className={styles.bar} data-toolbar-filters="">
                {primary.length > 0 ? <FilterControls {...props} filters={primary} /> : null}
                {secondary.length > 0 ? (
                    <PopoverTrigger>
                        <Button icon={ListFilter} data-toolbar-filter="">
                            <CountedLabel label={moreLabel} count={secondaryCount} />
                        </Button>
                        <Popover placement="bottom start" aria-label={moreLabel}>
                            <div className={styles.more}>
                                <FilterControls
                                    {...props}
                                    filters={secondary}
                                    aria-label={moreLabel}
                                    stacked
                                />
                            </div>
                        </Popover>
                    </PopoverTrigger>
                ) : null}
            </div>
            <div className={styles.compact}>
                <DialogTrigger>
                    <Button icon={SlidersHorizontal}>
                        <CountedLabel label={filtersLabel} count={activeCount} />
                    </Button>
                    <Dialog
                        title={filtersLabel}
                        size="sm"
                        footer={(close) => (
                            <>
                                {activeCount > 0 ? (
                                    <Button
                                        appearance="ghost"
                                        onPress={() =>
                                            filters
                                                .filter((filter) => isFilterActive(values, filter))
                                                .forEach((filter) => onChange(filter.id, undefined))
                                        }
                                    >
                                        {intl.formatMessage(messages.clearFilters)}
                                    </Button>
                                ) : null}
                                <Button tone="accent" onPress={close}>
                                    {intl.formatMessage(messages.filtersDone)}
                                </Button>
                            </>
                        )}
                    >
                        <FilterControls {...props} stacked />
                    </Dialog>
                </DialogTrigger>
            </div>
        </>
    );
}
