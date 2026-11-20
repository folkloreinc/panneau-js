import type { WidgetProps } from '@panneau/core';
import type { StatWidgetData } from '@panneau/protocol';
import { Card, Stat, type Tone } from '@panneau/ui';

import styles from '../Dashboard.module.css';
import { type BodyProps, formatOf } from './format';

function StatBody({ widget, data, currency }: BodyProps<StatWidgetData>) {
    return (
        <Card className={styles.widget}>
            <Stat
                label={widget.label}
                value={data.value}
                format={formatOf(widget, data, currency)}
                help={data.help ?? undefined}
                tone={(data.tone ?? undefined) as Tone | undefined}
                href={data.url ?? undefined}
                target={data.target}
            />
        </Card>
    );
}

/**
 * The `stat` widget (decision 0097): a number, with its change from the previous period. Its data
 * is checked against the protocol's schema of `stat` before it gets it.
 */
export function StatWidget({ widget, data, currency }: WidgetProps) {
    return <StatBody widget={widget} data={data as StatWidgetData} currency={currency} />;
}
