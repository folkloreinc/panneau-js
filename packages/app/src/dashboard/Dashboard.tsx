import { type CSSProperties, Component, type ReactNode, createElement } from 'react';
import { Link } from 'react-aria-components';
import type { FormatNumberOptions } from 'react-intl';

import { usePlugins } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type {
    BreakdownWidgetData,
    Definition,
    ListWidgetData,
    SeriesWidgetData,
    StatWidgetData,
    Widget,
} from '@panneau/protocol';
import { isBuiltInWidgetType } from '@panneau/protocol/runtime';
import {
    Alert,
    Badge,
    BarChart,
    Button,
    Card,
    LineChart,
    LoadingRegion,
    Skeleton,
    Stat,
    type Tone,
    usePanneauIntl,
} from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { HomePage } from '../pages/HomePage';
import { PageHeader, PageLayout } from '../pages/PageHeader';
import pageStyles from '../pages/pages.module.css';
import styles from './Dashboard.module.css';
import { type WidgetContent, useWidgetContent } from './widgetContent';

export interface DashboardProps {
    definition: Definition;
    basePath: string;
}

/** Columns of the grid of 12 a widget takes, without a `width`. */
function widthOf(widget: Widget): number {
    return widget.width ?? (widget.type === 'stat' ? 3 : 6);
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
                ) : widget.type === 'list' ? (
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
): string {
    const value = new Date(`${date}T00:00:00Z`);
    return period === 'month'
        ? intl.formatDate(value, { month: 'short', year: 'numeric', timeZone: 'UTC' })
        : intl.formatDate(value, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** The options of the numbers of a widget: amounts in a currency, for a sum of `money`. */
function formatOf(currency: string | undefined): FormatNumberOptions | undefined {
    return currency !== undefined ? { style: 'currency', currency } : undefined;
}

interface BodyProps<Data> {
    widget: Widget;
    data: Data;
    /** The currency of the values, for a sum of `money`. */
    currency?: string | undefined;
}

function StatBody({ widget, data, currency }: BodyProps<StatWidgetData>) {
    return (
        <Card className={styles.widget}>
            <Stat
                label={widget.label}
                value={data.value}
                format={formatOf(currency)}
                help={data.help ?? undefined}
                tone={(data.tone ?? undefined) as Tone | undefined}
                href={data.url ?? undefined}
                target={data.target}
            />
        </Card>
    );
}

function SeriesBody({ widget, data, currency }: BodyProps<SeriesWidgetData>) {
    const intl = usePanneauIntl();
    const format = formatOf(currency);
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
                        label: formatPointDate(intl, point.date, data.period),
                        value: point.value,
                    }))}
                    formatValue={(value) => intl.formatNumber(value, format)}
                />
            </div>
        </Card>
    );
}

function BreakdownBody({ widget, data, currency }: BodyProps<BreakdownWidgetData>) {
    const intl = usePanneauIntl();
    const format = formatOf(currency);
    const other = data.other ?? null;
    return (
        <Card title={widget.label} className={styles.widget}>
            {data.items.length === 0 && (other === null || other <= 0) ? (
                <p className={styles.empty}>{intl.formatMessage(appMessages.widgetEmpty)}</p>
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
                <p className={styles.empty}>
                    {data.empty ?? intl.formatMessage(appMessages.widgetEmpty)}
                </p>
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
}: {
    widget: Widget;
    content: WidgetContent;
    definition: Definition;
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

function DashboardWidget({ widget, definition, basePath }: DashboardProps & { widget: Widget }) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const drawn = isBuiltInWidgetType(widget.type) || plugins.widgets.has(widget.type);
    const content = useWidgetContent({
        widget,
        definition,
        basePath,
        untitled: (id) => intl.formatMessage(appMessages.widgetUntitled, { id }),
        enabled: drawn,
    });
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
                    <WidgetBody widget={widget} content={content} definition={definition} />
                </WidgetErrorBoundary>
            ) : (
                <Alert tone="warning">
                    {intl.formatMessage(appMessages.missingWidget, { type: widget.type })}
                </Alert>
            )}
        </div>
    );
}

function Widgets({ definition, basePath }: DashboardProps) {
    const intl = usePanneauIntl();
    const user = definition.user ?? null;
    useDocumentTitle([]);
    return (
        <PageLayout>
            <PageHeader title={definition.name} />
            {user !== null ? (
                <p className={pageStyles.intro}>
                    {intl.formatMessage(appMessages.welcome, { name: user.name })}
                </p>
            ) : null}
            <div className={styles.grid}>
                {(definition.dashboard?.widgets ?? []).map((widget) => (
                    <DashboardWidget
                        key={widget.id}
                        widget={widget}
                        definition={definition}
                        basePath={basePath}
                    />
                ))}
            </div>
        </PageLayout>
    );
}

/**
 * The built-in `dashboard` page (decisions 0064 and 0084): the widgets of `definition.dashboard`,
 * in a grid of 12 columns from their `width`, one column on a phone. Each widget draws its skeleton
 * while it loads, its error with "Try again", and nothing when the user can't see it, without
 * touching the others. Without widgets, the cards of the resources.
 */
export function Dashboard({ definition, basePath }: DashboardProps) {
    return (definition.dashboard?.widgets.length ?? 0) > 0 ? (
        <Widgets definition={definition} basePath={basePath} />
    ) : (
        <HomePage definition={definition} basePath={basePath} />
    );
}
