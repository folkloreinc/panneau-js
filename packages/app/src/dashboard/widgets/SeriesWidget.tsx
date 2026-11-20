import type { WidgetProps } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { SeriesWidgetData } from '@panneau/protocol';
import { Card, ChartLegend, LineChart, Stat, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Dashboard.module.css';
import { type BodyProps, SERIES_INTERACTIVE_POINTS, formatOf, formatPointDate } from './format';

/** The lines of a series with several (decision 0089), on the dates of all of them. */
function seriesLines(intl: ReturnType<typeof usePanneauIntl>, data: SeriesWidgetData) {
    const lines = data.series ?? [];
    const dates = [
        ...new Set(lines.flatMap((line) => line.points.map((point) => point.date))),
    ].sort();
    return lines.map((line) => {
        const values = new Map(line.points.map((point) => [point.date, point.value]));
        return {
            label: line.label,
            tone: (line.tone ?? undefined) as Tone | undefined,
            points: dates.map((date) => ({
                label: formatPointDate(intl, date, data.period, 'long'),
                shortLabel: formatPointDate(intl, date, data.period, 'short'),
                value: values.get(date) ?? 0,
            })),
        };
    });
}

function SeriesBody({ widget, data, currency }: BodyProps<SeriesWidgetData>) {
    const intl = usePanneauIntl();
    const format = formatOf(widget, data, currency);
    const formatValue = (value: number) => intl.formatNumber(value, format);
    const lines = data.series ?? [];
    if (lines.length > 0) {
        const chart = seriesLines(intl, data);
        const label = widget.label ?? intl.formatMessage(appMessages.widgetTotal);
        return (
            <Card title={widget.label} className={styles.widget}>
                <div className={styles.series}>
                    {data.total !== undefined && data.total !== null ? (
                        <Stat
                            label={intl.formatMessage(appMessages.widgetTotal)}
                            value={data.total}
                            format={format}
                        />
                    ) : null}
                    <LineChart
                        label={label}
                        series={chart}
                        stacked={widget.settings?.stacked === true}
                        formatValue={formatValue}
                        {...(format !== undefined && {
                            formatTick: (value: number) =>
                                intl.formatNumber(value, { ...format, notation: 'compact' }),
                        })}
                        isInteractive
                    />
                    <ChartLegend
                        label={label}
                        items={lines.map((line) => {
                            const alert =
                                line.alert !== undefined &&
                                line.alert !== null &&
                                line.alert.value > 0
                                    ? line.alert
                                    : null;
                            return {
                                label: line.label,
                                ...(line.total !== undefined &&
                                    line.total !== null && { value: formatValue(line.total) }),
                                ...(alert !== null
                                    ? {
                                          help: intl.formatMessage(appMessages.widgetAlert, {
                                              value: intl.formatNumber(alert.value),
                                              label: alert.label,
                                          }),
                                          helpTone: (alert.tone ?? 'danger') as Tone,
                                      }
                                    : line.help !== undefined &&
                                      line.help !== null && { help: line.help }),
                                tone: (line.tone ?? undefined) as Tone | undefined,
                                href: line.url ?? undefined,
                            };
                        })}
                    />
                </div>
            </Card>
        );
    }
    return (
        <Card title={widget.label} className={styles.widget}>
            <div className={styles.series}>
                {data.total !== undefined && data.total !== null ? (
                    <Stat
                        label={intl.formatMessage(appMessages.widgetTotal)}
                        value={data.total}
                        format={format}
                    />
                ) : null}
                <LineChart
                    label={widget.label ?? intl.formatMessage(appMessages.widgetTotal)}
                    points={data.points.map((point) => ({
                        label: formatPointDate(intl, point.date, data.period, 'long'),
                        shortLabel: formatPointDate(intl, point.date, data.period, 'short'),
                        value: point.value,
                    }))}
                    formatValue={(value) => intl.formatNumber(value, format)}
                    {...(format !== undefined && {
                        // Amounts on the scale too, short: $1K
                        formatTick: (value: number) =>
                            intl.formatNumber(value, { ...format, notation: 'compact' }),
                    })}
                    isInteractive={data.points.length > SERIES_INTERACTIVE_POINTS}
                />
            </div>
        </Card>
    );
}

/**
 * The `series` widget (decision 0097): lines of values by period, with their total. Its data is
 * checked against the protocol's schema of `series` before it gets it.
 */
export function SeriesWidget({ widget, data, currency }: WidgetProps) {
    return <SeriesBody widget={widget} data={data as SeriesWidgetData} currency={currency} />;
}
