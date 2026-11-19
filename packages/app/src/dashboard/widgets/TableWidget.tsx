import { Link } from 'react-aria-components';
import type { FormatNumberOptions } from 'react-intl';

import type { WidgetProps } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { TableWidgetData } from '@panneau/protocol';
import { readWidgetFormat } from '@panneau/protocol/runtime';
import { Card, EmptyState, Sparkline, Text, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Dashboard.module.css';
import { type BodyProps, formatOf } from './format';

/** The number of a cell of a table: a number, `null`, or a number with a tone, a word, a format. */
function cellOf(cell: TableWidgetData['rows'][number]['cells'][string] | undefined): {
    value: number | null | undefined;
    tone?: Tone | undefined;
    help?: string | undefined;
    format?: unknown;
} {
    if (cell === undefined || cell === null || typeof cell === 'number') {
        return { value: cell };
    }
    return {
        value: cell.value,
        tone: (cell.tone ?? undefined) as Tone | undefined,
        help: cell.help ?? undefined,
        format: cell.format,
    };
}

/**
 * A `table` (decision 0089): a row per subject, its label linking to its list, its numbers in
 * columns, aligned to the end and formatted, and its trend as a small line in a last column.
 */
function TableBody({ widget, data }: BodyProps<TableWidgetData>) {
    const intl = usePanneauIntl();
    const widgetFormat = formatOf(widget, data, undefined);
    const hasTrend = data.rows.some((row) => (row.points ?? []).length > 1);
    const url = data.url ?? undefined;
    return (
        <Card
            title={widget.label}
            className={styles.widget}
            footer={
                url !== undefined ? (
                    <Link href={url} className={styles.seeAll}>
                        {intl.formatMessage(appMessages.widgetSeeAll)}
                    </Link>
                ) : undefined
            }
        >
            {data.rows.length === 0 ? (
                <EmptyState
                    size="sm"
                    title={data.empty ?? intl.formatMessage(appMessages.widgetEmpty)}
                />
            ) : (
                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        {widget.label !== undefined ? (
                            <caption className={styles.visuallyHidden}>{widget.label}</caption>
                        ) : null}
                        <thead>
                            <tr>
                                <td />
                                {data.columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        data-align={column.align ?? 'end'}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                {hasTrend ? (
                                    <th scope="col" data-align="end">
                                        {intl.formatMessage(appMessages.widgetColumnTrend)}
                                    </th>
                                ) : null}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, index) => (
                                <tr key={index}>
                                    <th scope="row">
                                        {row.url !== undefined && row.url !== null ? (
                                            <Link href={row.url} className={styles.itemTitle}>
                                                {row.label}
                                            </Link>
                                        ) : (
                                            <span className={styles.itemTitle}>{row.label}</span>
                                        )}
                                    </th>
                                    {data.columns.map((column) => {
                                        const cell = cellOf(row.cells[column.key]);
                                        const format =
                                            (readWidgetFormat(cell.format) as
                                                FormatNumberOptions | undefined) ??
                                            (readWidgetFormat(column.format) as
                                                FormatNumberOptions | undefined) ??
                                            widgetFormat;
                                        // A cell missing is empty, a `null` says there is none
                                        const text =
                                            cell.value === undefined
                                                ? ''
                                                : cell.value !== null
                                                  ? intl.formatNumber(cell.value, format)
                                                  : '—';
                                        return (
                                            <td key={column.key} data-align={column.align ?? 'end'}>
                                                <Text as="span" size="sm" tone={cell.tone}>
                                                    {cell.help !== undefined && text !== ''
                                                        ? intl.formatMessage(
                                                              appMessages.widgetAlert,
                                                              { value: text, label: cell.help },
                                                          )
                                                        : text}
                                                </Text>
                                            </td>
                                        );
                                    })}
                                    {hasTrend ? (
                                        <td data-align="end" className={styles.trend}>
                                            {(row.points ?? []).length > 1 ? (
                                                <Sparkline
                                                    values={(row.points ?? []).map(
                                                        (point) => point.value,
                                                    )}
                                                />
                                            ) : null}
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}

/**
 * The `table` widget (decision 0097): rows of cells, with their links. Its data is checked against
 * the protocol's schema of `table` before it gets it.
 */
export function TableWidget({ widget, data }: WidgetProps) {
    return <TableBody widget={widget} data={data as TableWidgetData} />;
}
