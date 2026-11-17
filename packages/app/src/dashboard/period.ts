import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react';

import type { List, Router } from '@panneau/core';
import type { FilterValue } from '@panneau/protocol';
import {
    type OverviewPeriodOption,
    PERIOD_PARAM,
    type PeriodLike,
    type WidgetPeriod,
    findPeriodOption,
    getDefaultPeriod,
    getPeriodRange,
    isFilterRange,
    readPeriodOption,
} from '@panneau/protocol/runtime';

/** The chosen period of an overview (decision 0084), with its days, and how to choose another. */
export interface PeriodState {
    /** The chosen option, or `null` for a range of the list that isn't one of the options. */
    option: OverviewPeriodOption | null;
    /** The option and its days, for the widgets: `null` without one. */
    period: WidgetPeriod | null;
    choose: (option: OverviewPeriodOption) => void;
}

const NONE: PeriodState = { option: null, period: null, choose: () => undefined };

const subscribeNothing = () => () => undefined;

/** The value of a parameter of the URL that a router keeps, or `null` without a router. */
function useRouterParam(router: Router | null, name: string): string | null {
    return useSyncExternalStore(
        router?.subscribe ?? subscribeNothing,
        () => (router !== null ? new URLSearchParams(router.getSearch()).get(name) : null),
        () => null,
    );
}

/** The search of a router with some parameters set, after removing those that `remove` matches. */
function searchWith(
    router: Router,
    set: Record<string, string>,
    remove: (key: string) => boolean = () => false,
): string {
    const params = new URLSearchParams(router.getSearch());
    [...params.keys()].filter(remove).forEach((key) => params.delete(key));
    Object.entries(set).forEach(([key, value]) => params.set(key, value));
    return params.toString();
}

const withDays = (option: OverviewPeriodOption | null): WidgetPeriod | null =>
    option !== null ? { option, ...getPeriodRange(option) } : null;

/**
 * The period of a dashboard page (decision 0084): the option of `?period=` in the URL, when the
 * page offers it, else its default. Choosing one keeps it in the URL. Without a router, the choice
 * lasts as long as the page.
 */
export function useDashboardPeriod(
    period: PeriodLike | undefined,
    router: Router | null,
): PeriodState {
    const param = useRouterParam(router, PERIOD_PARAM);
    const [chosen, setChosen] = useState<string | null>(null);
    if (period === undefined) {
        return NONE;
    }
    const option = readPeriodOption(router !== null ? param : chosen, period);
    return {
        option,
        period: withDays(option),
        choose: (next) => {
            if (router !== null) {
                router.setSearch(searchWith(router, { [PERIOD_PARAM]: next }));
            } else {
                setChosen(next);
            }
        },
    };
}

interface SummaryPeriodOptions {
    /** The period of the summary, or `undefined`. */
    period: PeriodLike | undefined;
    /** The id of the list's `date-range` filter that the period is. */
    filter: string | null;
    /** The list, and the value of that filter in its query. */
    list: List;
    value: FilterValue | undefined;
    router: Router | null;
}

/**
 * The period of the summary of a resource (decision 0084): the list's own `date-range` filter, so
 * choosing one filters the rows too. The URL keeps the option (`?period=30d`) with the days of the
 * filter, so that a link or a reload another day gets the days of that day.
 *
 * - A URL with an option sets the filter to its days.
 * - A URL with neither an option nor that filter gets the default.
 * - A URL with the filter alone (a link of a widget, a range chosen in the list's filters) keeps
 *   it: the option whose days it has is chosen, or none.
 *
 * Without a router, the period is the filter of the list alone.
 */
export function useSummaryPeriod({
    period,
    filter,
    list,
    value,
    router,
}: SummaryPeriodOptions): PeriodState {
    const param = useRouterParam(router, PERIOD_PARAM);
    const [initialSearch] = useState(() => router?.getSearch() ?? '');
    const synced = useRef(false);
    const active = period !== undefined && filter !== null;
    const filterKey = `filter[${filter ?? ''}]`;
    const fromKey = `${filterKey}[from]`;
    const toKey = `${filterKey}[to]`;
    const fromParam =
        active && param !== null && period.options.includes(param)
            ? readPeriodOption(param, period)
            : null;
    const matches = (option: OverviewPeriodOption | null) => {
        if (option === null || !isFilterRange(value)) {
            return false;
        }
        const days = getPeriodRange(option);
        return String(value.from ?? '') === days.from && String(value.to ?? '') === days.to;
    };
    // Sets the filter to the days of an option, and keeps the option in the URL
    const apply = (option: OverviewPeriodOption, replace: boolean) => {
        if (filter === null) {
            return;
        }
        const days = getPeriodRange(option);
        if (router === null) {
            list.setFilter(filter, days);
            return;
        }
        router.setSearch(
            searchWith(
                router,
                {
                    [fromKey]: days.from,
                    [toKey]: days.to,
                    [PERIOD_PARAM]: option,
                },
                // Another period starts the list over, on its first page
                (key) => key === 'page' || key === 'cursor' || key.startsWith(filterKey),
            ),
            { replace },
        );
    };
    const hasValue = value !== undefined;
    const fromParamMatches = matches(fromParam);
    const sync = useEffectEvent(() => {
        if (!active) {
            return;
        }
        if (!synced.current) {
            synced.current = true;
            const initial = new URLSearchParams(initialSearch);
            const initialParam = initial.get(PERIOD_PARAM);
            const initialOption =
                initialParam !== null && period.options.includes(initialParam)
                    ? readPeriodOption(initialParam, period)
                    : null;
            if (initialOption !== null) {
                if (!fromParamMatches) {
                    apply(initialOption, true);
                }
            } else if (![...initial.keys()].some((key) => key.startsWith(filterKey))) {
                // Not a range that a remembered view brings back: the default, with today's days
                const fallback = getDefaultPeriod(period);
                if (fallback !== null && (router !== null || !hasValue)) {
                    apply(fallback, true);
                }
            }
            return;
        }
        // The range changed in the list's filters: the option of the URL no longer says it
        if (router !== null && fromParam !== null && !fromParamMatches) {
            router.setSearch(
                searchWith(router, {}, (key) => key === PERIOD_PARAM),
                { replace: true },
            );
        }
    });
    useEffect(() => {
        sync();
    }, [active, fromParam, fromParamMatches, hasValue]);
    if (!active) {
        return NONE;
    }
    const option = fromParamMatches
        ? fromParam
        : (findPeriodOption(value, period) ??
          // Until the filter is set, the option it will have
          (!hasValue ? (fromParam ?? getDefaultPeriod(period)) : null));
    return {
        option,
        period: withDays(option),
        choose: (next) => apply(next, false),
    };
}
