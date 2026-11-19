import type { WidgetProps } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { MetricWidgetData } from '@panneau/protocol';
import { WIDGET_METRIC_MAX_PARTS } from '@panneau/protocol/runtime';
import { BarChart, Card, Sparkline, Stat, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Dashboard.module.css';
import { type BodyProps, changeOf, formatOf } from './format';

/**
 * A `metric` (decision 0089): its number, its change from the previous period, its trend as a
 * small line, and its largest parts as bars, the rest as "Other".
 */
function MetricBody({ widget, data, currency, period }: BodyProps<MetricWidgetData>) {
    const intl = usePanneauIntl();
    const format = formatOf(widget, data, currency);
    const formatValue = (value: number) => intl.formatNumber(value, format);
    const points = data.points ?? [];
    const first = points[0];
    const last = points.at(-1);
    const parts = [...(data.parts ?? [])].sort((a, b) => b.value - a.value);
    const shown = parts.slice(0, WIDGET_METRIC_MAX_PARTS);
    const rest =
        parts.slice(WIDGET_METRIC_MAX_PARTS).reduce((sum, part) => sum + part.value, 0) +
        (data.other ?? 0);
    return (
        <Card className={styles.widget}>
            <div className={styles.metric}>
                <Stat
                    label={widget.label}
                    value={data.value}
                    format={format}
                    help={data.help ?? undefined}
                    tone={(data.tone ?? undefined) as Tone | undefined}
                    href={data.url ?? undefined}
                    target={data.target}
                    change={changeOf(intl, data.value, data.previous, {
                        format,
                        period,
                        goodWhen: widget.settings?.goodWhen,
                    })}
                />
                {first !== undefined && last !== undefined && points.length > 1 ? (
                    <Sparkline
                        values={points.map((point) => point.value)}
                        label={intl.formatMessage(appMessages.widgetTrend, {
                            first: formatValue(first.value),
                            last: formatValue(last.value),
                        })}
                    />
                ) : null}
                {shown.length > 0 ? (
                    <BarChart
                        label={widget.label ?? intl.formatMessage(appMessages.widgetTotal)}
                        items={shown.map((part) => ({
                            label: part.label,
                            value: part.value,
                            tone: (part.tone ?? undefined) as Tone | undefined,
                            href: part.url ?? undefined,
                        }))}
                        other={rest > 0 ? rest : null}
                        formatValue={formatValue}
                    />
                ) : null}
            </div>
        </Card>
    );
}

/**
 * The `metric` widget (decision 0097): a number with its sparkline and its parts. Its data is
 * checked against the protocol's schema of `metric` before it gets it.
 */
export function MetricWidget({ widget, data, currency, period }: WidgetProps) {
    return (
        <MetricBody
            widget={widget}
            data={data as MetricWidgetData}
            currency={currency}
            period={period}
        />
    );
}
