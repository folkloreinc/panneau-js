import { type FilterRange, isFilterRange } from './query';

/**
 * The periods an overview can offer (decision 0084): the 7, 30 or 90 days ending today, the current
 * calendar month, and the last 12 months.
 */
export const OVERVIEW_PERIODS = ['7d', '30d', '90d', 'month', 'year'] as const;

export type OverviewPeriodOption = (typeof OVERVIEW_PERIODS)[number];

/** The query parameter of the chosen period, in the URL of a dashboard page or a list. */
export const PERIOD_PARAM = 'period';

/** A period as the helpers read it: the `period` of a dashboard page or of a summary. */
export interface PeriodLike {
    options: readonly string[];
    default?: string | undefined;
}

/** The days of a period, both inclusive: `2026-10-19` to `2026-11-17`. */
export interface PeriodRange {
    from: string;
    to: string;
}

/** The chosen period of an overview, with its days, as widgets with an endpoint get it. */
export interface WidgetPeriod extends PeriodRange {
    option: OverviewPeriodOption;
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function isOverviewPeriod(value: unknown): value is OverviewPeriodOption {
    return (OVERVIEW_PERIODS as readonly unknown[]).includes(value);
}

/** Whether a string is a day, `2026-11-17`, that exists. */
export function isDay(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    const match = DAY.exec(value);
    if (match === null) {
        return false;
    }
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return date.toISOString().slice(0, 10) === value;
}

/** The day of a date in the time zone of the browser (or of the runtime): `2026-11-17`. */
export function localDay(date: Date = new Date()): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A day as a date at midnight UTC, for the arithmetic of days. */
function utcDay(day: string): Date {
    const match = DAY.exec(day);
    if (match === null) {
        throw new Error(`Not a day: ${day}.`);
    }
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

const toDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The days of a period, both inclusive, ending `today` (decision 0084):
 *
 * - `7d`, `30d`, `90d`: the 7, 30 or 90 days ending today, today included;
 * - `month`: the current calendar month, from its first day to today;
 * - `year`: the last 12 months, the current month and the 11 before it, from the first day of the
 *   month 11 months ago to today.
 *
 * `today` is a day (`2026-11-17`), or a date read in the local time zone: the browser's, for the
 * user.
 */
export function getPeriodRange(
    option: OverviewPeriodOption,
    today: string | Date = new Date(),
): PeriodRange {
    const to = typeof today === 'string' ? today : localDay(today);
    const end = utcDay(to);
    const days = DAYS[option];
    if (days !== undefined) {
        return { from: toDay(new Date(end.getTime() - (days - 1) * 86_400_000)), to };
    }
    const back = option === 'year' ? 11 : 0;
    return {
        from: toDay(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - back, 1))),
        to,
    };
}

/** The period an overview starts on: its `default`, or its first option. */
export function getDefaultPeriod(period: PeriodLike): OverviewPeriodOption | null {
    const candidate = period.default ?? period.options[0];
    return isOverviewPeriod(candidate) ? candidate : null;
}

/**
 * The period chosen in a URL (`?period=90d`), when it is an option of the overview: else its
 * default.
 */
export function readPeriodOption(
    value: string | null | undefined,
    period: PeriodLike,
): OverviewPeriodOption | null {
    return isOverviewPeriod(value) && period.options.includes(value)
        ? value
        : getDefaultPeriod(period);
}

/** The option of an overview whose days are those of a range, if one is: else `null`. */
export function findPeriodOption(
    range: unknown,
    period: PeriodLike,
    today: string | Date = new Date(),
): OverviewPeriodOption | null {
    if (!isFilterRange(range)) {
        return null;
    }
    const { from, to } = range as FilterRange;
    return (
        period.options.filter(isOverviewPeriod).find((option) => {
            const days = getPeriodRange(option, today);
            return days.from === String(from) && days.to === String(to);
        }) ?? null
    );
}
