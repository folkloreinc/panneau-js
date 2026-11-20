// What the built-in widgets share: the format of their numbers and dates, and their changes.
import type { FormatNumberOptions } from 'react-intl';

import { appMessages } from '@panneau/intl';
import type { SeriesWidgetData, Widget } from '@panneau/protocol';
import {
    type OverviewPeriodOption,
    getChangeTone,
    getWidgetChange,
    readWidgetFormat,
} from '@panneau/protocol/runtime';
import type { usePanneauIntl } from '@panneau/ui';
import { type StatChange } from '@panneau/ui';

/** The date of a point, for its period: a day, the first day of a week, a month. */
export function formatPointDate(
    intl: ReturnType<typeof usePanneauIntl>,
    date: string,
    period: SeriesWidgetData['period'],
    length: 'long' | 'short',
): string {
    const value = new Date(`${date}T00:00:00Z`);
    return period === 'month'
        ? intl.formatDate(value, { month: length, year: 'numeric', timeZone: 'UTC' })
        : intl.formatDate(value, {
              month: length,
              day: 'numeric',
              ...(length === 'long' && { year: 'numeric' }),
              timeZone: 'UTC',
          });
}

/** Past this number of points, a series shows the value under the pointer: its days can't be read from the scale. */
export const SERIES_INTERACTIVE_POINTS = 31;

/**
 * The options of the numbers of a widget (decision 0089): the `format` of its data, the `format`
 * of its settings over it, else amounts in a currency, for a sum of `money`.
 */
export function formatOf(
    widget: Widget,
    data: { format?: unknown },
    currency: string | undefined,
): FormatNumberOptions | undefined {
    return (
        (readWidgetFormat(data.format, widget.settings?.format) as
            FormatNumberOptions | undefined) ??
        (currency !== undefined ? { style: 'currency', currency } : undefined)
    );
}

export interface BodyProps<Data> {
    widget: Widget;
    data: Data;
    /** The currency of the values, for a sum of `money`. */
    currency?: string | undefined;
    /** The option of the period of the overview, when the widget follows it. */
    period?: OverviewPeriodOption | null | undefined;
}

/** Days of the periods that are a number of days. */
const PERIOD_DAYS: Partial<Record<OverviewPeriodOption, number>> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
};

/**
 * The change of a number from the previous period (decision 0089): a percent, or the difference
 * when it was 0, and from what: the previous days of the period, the same days of the month or the
 * year before. In the tone of good or bad news only with `goodWhen`.
 */
export function changeOf(
    intl: ReturnType<typeof usePanneauIntl>,
    value: number,
    previous: number | null | undefined,
    {
        format,
        period,
        goodWhen,
    }: {
        format: FormatNumberOptions | undefined;
        period: OverviewPeriodOption | null | undefined;
        goodWhen: unknown;
    },
): StatChange | undefined {
    if (previous === undefined || previous === null) {
        return undefined;
    }
    const change = getWidgetChange(value, previous);
    const amount =
        change.direction === 'none'
            ? intl.formatMessage(appMessages.widgetNoChange)
            : change.ratio !== null
              ? intl.formatNumber(Math.abs(change.ratio), {
                    style: 'percent',
                    maximumFractionDigits: Math.abs(change.ratio) < 0.1 ? 1 : 0,
                })
              : intl.formatNumber(Math.abs(change.difference), format);
    const days = period !== null && period !== undefined ? PERIOD_DAYS[period] : undefined;
    const label =
        days !== undefined
            ? intl.formatMessage(appMessages.widgetChangeDays, { change: amount, days })
            : period === 'month'
              ? intl.formatMessage(appMessages.widgetChangeMonth, { change: amount })
              : period === 'year'
                ? intl.formatMessage(appMessages.widgetChangeYear, { change: amount })
                : intl.formatMessage(appMessages.widgetChangePrevious, { change: amount });
    const tone = getChangeTone(change.direction, goodWhen);
    return { direction: change.direction, label, ...(tone !== null && { tone }) };
}
