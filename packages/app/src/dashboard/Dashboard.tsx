import { type CSSProperties, Component, type ReactNode, createElement } from 'react';

import { type WidgetProps, getEntries, resolveEntry, usePanneau, usePlugins } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { Definition, Widget } from '@panneau/protocol';
import {
    HOME_PAGE,
    type OverviewPeriodOption,
    type WidgetPeriod,
    followsPeriod,
    getDashboardPeriod,
    getDashboardWidgets,
    isBuiltInWidgetType,
    labelOrKey,
} from '@panneau/protocol/runtime';
import {
    Alert,
    BarChart,
    Button,
    Card,
    LineChart,
    LoadingRegion,
    Skeleton,
    Sparkline,
    Stat,
    Tile,
    TileGroup,
    usePanneauIntl,
} from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { HomePage } from '../pages/HomePage';
import { PageHeader, PageLayout } from '../pages/PageHeader';
import pageStyles from '../pages/pages.module.css';
import styles from './Dashboard.module.css';
import { widthOf } from './DashboardSkeleton';
import { PeriodControl } from './PeriodControl';
import { type PeriodState, useDashboardPeriod } from './period';
import { type WidgetContent, type WidgetSummary, useWidgetContent } from './widgetContent';
import { builtInWidgets } from './widgets';

export interface DashboardProps {
    definition: Definition;
    basePath: string;
    /** The id of the page in `pages` (decision 0084): `home`, the home page, by default. */
    page?: string;
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
                    <TileGroup className={styles.items}>
                        {[0, 1, 2].map((index) => (
                            <Tile
                                key={index}
                                size="sm"
                                title={<Skeleton width={`${70 - index * 15}%`} />}
                            />
                        ))}
                    </TileGroup>
                ) : (
                    <Skeleton shape="rect" height="6rem" />
                )}
            </LoadingRegion>
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
    // A plugin's widget, or a built-in one, which a plugin can replace (decision 0097)
    const Entry = resolveEntry(plugins, 'widgets', widget.type, { builtIn: builtInWidgets });
    const props: WidgetProps = {
        widget,
        data: content.data,
        definition,
        currency: content.currency,
        period,
    };
    // The built-in widgets draw their own card; the dashboard draws the card of the others
    return Entry !== undefined &&
        isBuiltInWidgetType(widget.type) &&
        Entry === builtInWidgets[widget.type] ? (
        createElement(Entry, props)
    ) : (
        <Card title={widget.label} className={styles.widget}>
            {Entry !== undefined ? createElement(Entry, props) : null}
        </Card>
    );
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
    const drawn = getEntries(plugins, 'widgets', { builtIn: builtInWidgets }).has(widget.type);
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
    const title = labelOrKey(definition.pages?.[page]?.label, page);
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
