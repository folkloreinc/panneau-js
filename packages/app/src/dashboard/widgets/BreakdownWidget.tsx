import type { WidgetProps } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { BreakdownWidgetData } from '@panneau/protocol';
import { BarChart, Card, EmptyState, Stat, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Dashboard.module.css';
import { type BodyProps, formatOf } from './format';

function BreakdownBody({ widget, data, currency }: BodyProps<BreakdownWidgetData>) {
    const intl = usePanneauIntl();
    const format = formatOf(widget, data, currency);
    const other = data.other ?? null;
    return (
        <Card title={widget.label} className={styles.widget}>
            {data.items.length === 0 && (other === null || other <= 0) ? (
                <EmptyState size="sm" title={intl.formatMessage(appMessages.widgetEmpty)} />
            ) : (
                <div className={styles.series}>
                    {data.total !== undefined && data.total !== null ? (
                        <Stat
                            label={intl.formatMessage(appMessages.widgetTotal)}
                            value={data.total}
                            format={format}
                        />
                    ) : null}
                    <BarChart
                        label={widget.label ?? intl.formatMessage(appMessages.widgetTotal)}
                        items={data.items.map((item) => ({
                            label: item.label,
                            value: item.value,
                            tone: (item.tone ?? undefined) as Tone | undefined,
                            href: item.url ?? undefined,
                        }))}
                        other={other}
                        formatValue={(value) => intl.formatNumber(value, format)}
                    />
                </div>
            )}
        </Card>
    );
}

/**
 * The `breakdown` widget (decision 0097): the parts of a total, as bars. Its data is checked
 * against the protocol's schema of `breakdown` before it gets it.
 */
export function BreakdownWidget({ widget, data, currency }: WidgetProps) {
    return <BreakdownBody widget={widget} data={data as BreakdownWidgetData} currency={currency} />;
}
