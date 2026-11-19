import { type CSSProperties, Component, type ReactNode, createElement } from 'react';
import { Link } from 'react-aria-components';
import type { FormatNumberOptions } from 'react-intl';

import { usePanneau, usePlugins } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type {
    BreakdownWidgetData,
    Definition,
    ListWidgetData,
    MetricWidgetData,
    SeriesWidgetData,
    StatWidgetData,
    TableWidgetData,
    Widget,
} from '@panneau/protocol';
import {
    HOME_PAGE,
    type OverviewPeriodOption,
    WIDGET_METRIC_MAX_PARTS,
    type WidgetPeriod,
    followsPeriod,
    getChangeTone,
    getDashboardPeriod,
    getDashboardWidgets,
    getWidgetChange,
    isBuiltInWidgetType,
    readWidgetFormat,
} from '@panneau/protocol/runtime';
import {
    Alert,
    Badge,
    BarChart,
    Button,
    Card,
    ChartLegend,
    EmptyState,
    LineChart,
    LoadingRegion,
    Skeleton,
    Sparkline,
    Stat,
    type StatChange,
    Text,
    type Tone,
    usePanneauIntl,
} from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { HomePage } from '../pages/HomePage';
import { PageHeader, PageLayout } from '../pages/PageHeader';
import pageStyles from '../pages/pages.module.css';
import styles from './Dashboard.module.css';
import { PeriodControl } from './PeriodControl';
import { type PeriodState, useDashboardPeriod } from './period';
import { type WidgetContent, type WidgetSummary, useWidgetContent } from './widgetContent';

export interface DashboardProps {
    definition: Definition;
    basePath: string;
    /** The id of the page in `pages` (decision 0084): `home`, the home page, by default. */
    page?: string;
}

/** Columns of the grid of 12 a widget takes, without a `width`. */
function widthOf(widget: Widget): number {
    return widget.width ?? (widget.type === 'stat' ? 3 : widget.type === 'metric' ? 4 : 6);
}

/** Keeps a widget that throws while it draws from taking the others down. */
class WidgetErrorBoundary extends Component<
    { fallback: (retry: () => void) => ReactNode; children?: ReactNode },
    { failed: boolean }
> {
    override state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    override render() {
        return this.state.failed
            ? this.props.fallback(() => this.setState({ failed: false }))
            : this.props.children;
    }
}

function WidgetError({ widget, retry }: { widget: Widget; retry: () => void }) {
    const intl = usePanneauIntl();
    return (
        <Card title={widget.label} headingLevel={2} className={styles.widget}>
            <Alert tone="danger">
                <p>{intl.formatMessage(appMessages.widgetError)}</p>
                <Button size="sm" onPress={retry}>
                    {intl.formatMessage(appMessages.retry)}
                </Button>
            </Alert>
        </Card>
    );
}

/** The skeleton of a widget, in the shape of its type (decision 0034). */
function WidgetSkeleton({ widget }: { widget: Widget }) {
    const intl = usePanneauIntl();
    const label =
        widget.label !== undefined
            ? intl.formatMessage(appMessages.widgetLoading, { label: widget.label })
            : undefined;
    if (widget.type === 'stat') {
        return (
            <Card className={styles.widget}>
                <LoadingRegion {...(label !== undefined && { label })}>
                    <Stat label={widget.label} help="" />
                </LoadingRegion>
            </Card>
        );
    }
    if (widget.type === 'metric') {
        return (
            <Card className={styles.widget}>
                <LoadingRegion {...(label !== undefined && { label })}>
                    <div className={styles.metric}>
                        <Stat label={widget.label} help="" />
                        <Sparkline />
                    </div>
                </LoadingRegion>
            </Card>
        );
    }
    return (
        <Card title={widget.label} className={styles.widget}>
            <LoadingRegion {...(label !== undefined && { label })}>
                {widget.type === 'series' ? (
                    <div className={styles.series}>
                        <Stat label={intl.formatMessage(appMessages.widgetTotal)} />
                        <LineChart label={widget.label ?? ''} />
                    </div>
                ) : widget.type === 'breakdown' ? (
                    <BarChart label={widget.label ?? ''} />
                ) : widget.type === 'list' || widget.type === 'table' ? (
                    <ul className={styles.items}>
                        {[0, 1, 2].map((index) => (
                            <li key={index} className={styles.item}>
                                <Skeleton width={`${70 - index * 15}%`} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Skeleton shape="rect" height="6rem" />
                )}
            </LoadingRegion>
        </Card>
    );
}

/** The date of a point, for its period: a day, the first day of a week, a month. */
function formatPointDate(
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
const SERIES_INTERACTIVE_POINTS = 31;

/**
 * The options of the numbers of a widget (decision 0089): the `format` of its data, the `format`
 * of its settings over it, else amounts in a currency, for a sum of `money`.
 */
function formatOf(
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

interface BodyProps<Data> {
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
function changeOf(
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

function ListBody({ widget, data }: { widget: Widget; data: ListWidgetData }) {
    const intl = usePanneauIntl();
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
            {data.items.length === 0 ? (
                <EmptyState
                    size="sm"
                    title={data.empty ?? intl.formatMessage(appMessages.widgetEmpty)}
                />
            ) : (
                <ul className={styles.items}>
                    {data.items.map((item, index) => (
                        <li key={index} className={styles.item}>
                            <div className={styles.itemText}>
                                {item.url !== undefined && item.url !== null ? (
                                    <Link href={item.url} className={styles.itemTitle}>
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className={styles.itemTitle}>{item.title}</span>
                                )}
                                {item.description !== undefined && item.description !== null ? (
                                    <span className={styles.itemDescription}>
                                        {item.description}
                                    </span>
                                ) : null}
                            </div>
                            {item.meta !== undefined && item.meta !== null ? (
                                <span className={styles.itemMeta}>{item.meta}</span>
                            ) : null}
                            {item.badge !== undefined && item.badge !== null ? (
                                <Badge tone={(item.badge.tone ?? 'neutral') as Tone}>
                                    {item.badge.label}
                                </Badge>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function WidgetBody({
    widget,
    content,
    definition,
    period,
}: {
    widget: Widget;
    content: WidgetContent;
    definition: Definition;
    period: OverviewPeriodOption | null;
}) {
    const plugins = usePlugins();
    if (content.status === 'loading') {
        return <WidgetSkeleton widget={widget} />;
    }
    if (content.status === 'error') {
        return <WidgetError widget={widget} retry={content.retry} />;
    }
    if (content.status === 'hidden') {
        return null;
    }
    switch (widget.type) {
        case 'stat':
            return (
                <StatBody
                    widget={widget}
                    data={content.data as StatWidgetData}
                    currency={content.currency}
                />
            );
        case 'series':
            return (
                <SeriesBody
                    widget={widget}
                    data={content.data as SeriesWidgetData}
                    currency={content.currency}
                />
            );
        case 'list':
            return <ListBody widget={widget} data={content.data as ListWidgetData} />;
        case 'breakdown':
            return (
                <BreakdownBody
                    widget={widget}
                    data={content.data as BreakdownWidgetData}
                    currency={content.currency}
                />
            );
        case 'metric':
            return (
                <MetricBody
                    widget={widget}
                    data={content.data as MetricWidgetData}
                    currency={content.currency}
                    period={period}
                />
            );
        case 'table':
            return <TableBody widget={widget} data={content.data as TableWidgetData} />;
        default: {
            const Plugin = plugins.widgets.get(widget.type);
            return (
                <Card title={widget.label} className={styles.widget}>
                    {Plugin !== undefined
                        ? createElement(Plugin, { widget, data: content.data, definition })
                        : null}
                </Card>
            );
        }
    }
}

function DashboardWidget({
    widget,
    page,
    summary,
    period,
    definition,
    basePath,
}: Omit<DashboardGridProps, 'widgets'> & { widget: Widget }) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const drawn = isBuiltInWidgetType(widget.type) || plugins.widgets.has(widget.type);
    const content = useWidgetContent({
        widget,
        page,
        summary,
        period,
        definition,
        basePath,
        untitled: (id) => intl.formatMessage(appMessages.widgetUntitled, { id }),
        texts: {
            total: intl.formatMessage(appMessages.widgetTotal),
            change: intl.formatMessage(appMessages.widgetColumnChange),
            alerts: intl.formatMessage(appMessages.widgetColumnAlerts),
            other: intl.formatMessage(appMessages.widgetOther),
        },
        enabled: drawn,
    });
    const followed =
        period !== null && period !== undefined && followsPeriod(widget, summary?.resource)
            ? period.option
            : null;
    if (drawn && content.status === 'hidden') {
        return null;
    }
    return (
        <div
            className={styles.cell}
            style={{ '--_panneau-widget-span': widthOf(widget) } as CSSProperties}
            data-widget={widget.id}
        >
            {drawn ? (
                <WidgetErrorBoundary
                    fallback={(retry) => <WidgetError widget={widget} retry={retry} />}
                >
                    <WidgetBody
                        widget={widget}
                        content={content}
                        definition={definition}
                        period={followed}
                    />
                </WidgetErrorBoundary>
            ) : (
                <Alert tone="warning">
                    {intl.formatMessage(appMessages.missingWidget, { type: widget.type })}
                </Alert>
            )}
        </div>
    );
}

export interface DashboardGridProps {
    /** The widgets, in order. */
    widgets: Widget[];
    /** The page whose dashboard holds them, for the data of their own: the home page without it. */
    page?: string | undefined;
    /**
     * The summary of a resource that holds them, instead of a page (decision 0084): the widgets on
     * that resource and those with data of their own get the current query of its list.
     */
    summary?: WidgetSummary | undefined;
    /** The period chosen in the overview: the widgets that follow it get it (decision 0084). */
    period?: WidgetPeriod | null | undefined;
    definition: Definition;
    basePath: string;
}

/**
 * The widgets of a dashboard (decision 0064), in a grid of 12 columns from their `width`, one
 * column on a phone. Each widget draws its skeleton while it loads, its error with "Try again", and
 * nothing when the user can't see it, without touching the others.
 */
export function DashboardGrid({
    widgets,
    page,
    summary,
    period,
    definition,
    basePath,
}: DashboardGridProps) {
    return (
        <div className={styles.grid}>
            {widgets.map((widget) => (
                <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    page={page}
                    summary={summary}
                    period={period}
                    definition={definition}
                    basePath={basePath}
                />
            ))}
        </div>
    );
}

/** The period of a dashboard page in its header, with the widgets it changes (decision 0084). */
function periodControl(
    state: PeriodState,
    options: readonly string[] | undefined,
    widgets: Widget[],
) {
    return options !== undefined && widgets.length > 0 ? (
        <PeriodControl
            options={options}
            value={state.option}
            onChange={state.choose}
            widgets={widgets}
            following={widgets.filter((widget) => followsPeriod(widget))}
        />
    ) : undefined;
}

/** The home page with widgets: the name of the app and a welcome above them. */
function HomeDashboard({ widgets, definition, basePath }: DashboardGridProps) {
    const intl = usePanneauIntl();
    const user = definition.user ?? null;
    const options = getDashboardPeriod(definition)?.options;
    const period = useDashboardPeriod(getDashboardPeriod(definition), usePanneau().router);
    useDocumentTitle([]);
    return (
        <PageLayout>
            <PageHeader title={definition.name} actions={periodControl(period, options, widgets)} />
            {user !== null ? (
                <p className={pageStyles.intro}>
                    {intl.formatMessage(appMessages.welcome, { name: user.name })}
                </p>
            ) : null}
            <DashboardGrid
                widgets={widgets}
                period={period.period}
                definition={definition}
                basePath={basePath}
            />
        </PageLayout>
    );
}

/** Another dashboard page: its label, then its widgets, or a message without any. */
function PageDashboard({
    widgets,
    page,
    definition,
    basePath,
}: DashboardGridProps & { page: string }) {
    const intl = usePanneauIntl();
    const title = definition.pages?.[page]?.label ?? page;
    const options = getDashboardPeriod(definition, page)?.options;
    const period = useDashboardPeriod(getDashboardPeriod(definition, page), usePanneau().router);
    useDocumentTitle([title]);
    return (
        <PageLayout>
            <PageHeader title={title} actions={periodControl(period, options, widgets)} />
            {widgets.length > 0 ? (
                <DashboardGrid
                    widgets={widgets}
                    page={page}
                    period={period.period}
                    definition={definition}
                    basePath={basePath}
                />
            ) : (
                <p className={pageStyles.intro}>{intl.formatMessage(appMessages.dashboardEmpty)}</p>
            )}
        </PageLayout>
    );
}

/**
 * The built-in `dashboard` page (decisions 0064 and 0084): the widgets of its page, in a grid.
 * The home page has the name of the app and a welcome above them, and the cards of the resources
 * without widgets. Another page has its label above them, and says when it has none.
 */
export function Dashboard({ definition, basePath, page = HOME_PAGE }: DashboardProps) {
    const widgets = getDashboardWidgets(definition, page);
    if (page !== HOME_PAGE) {
        return (
            <PageDashboard
                key={page}
                widgets={widgets}
                page={page}
                definition={definition}
                basePath={basePath}
            />
        );
    }
    return widgets.length > 0 ? (
        <HomeDashboard widgets={widgets} definition={definition} basePath={basePath} />
    ) : (
        <HomePage definition={definition} basePath={basePath} />
    );
}
