import type { CSSProperties } from 'react';

import { appMessages } from '@panneau/intl';
import type { Definition, Widget } from '@panneau/protocol';
import { HOME_PAGE, getDashboardWidgets, labelOrKey } from '@panneau/protocol/runtime';
import { Card, LoadingRegion, Skeleton, Stat, usePanneauIntl } from '@panneau/ui';

import { PageHeader, PageLayout } from '../pages/PageHeader';
import styles from './Dashboard.module.css';

/** Columns of the grid of 12 a widget takes, without a `width`. */
export function widthOf(widget: Widget): number {
    return widget.width ?? (widget.type === 'stat' ? 3 : widget.type === 'metric' ? 4 : 6);
}

/**
 * A widget while the code of the dashboards loads (decision 0034): its card, and a block of the
 * height of its type. Once the code is there, the widget draws its own skeleton, in the shape of
 * its chart, while its data loads.
 */
function WidgetCodeSkeleton({ widget }: { widget: Widget }) {
    const intl = usePanneauIntl();
    const label =
        widget.label !== undefined
            ? intl.formatMessage(appMessages.widgetLoading, { label: widget.label })
            : undefined;
    const small = widget.type === 'stat' || widget.type === 'metric';
    return (
        <Card {...(!small && { title: widget.label })} className={styles.widget}>
            <LoadingRegion {...(label !== undefined && { label })}>
                {small ? <Stat label={widget.label} help="" /> : null}
                <Skeleton shape="rect" height={small ? '2rem' : '8rem'} />
            </LoadingRegion>
        </Card>
    );
}

/**
 * The widgets of a dashboard while the code of the dashboards loads (#346): the skeleton of each
 * one, in the grid, as `DashboardGrid` places them.
 */
export function DashboardGridSkeleton({ widgets }: { widgets: readonly Widget[] }) {
    return (
        <div className={styles.grid}>
            {widgets.map((widget) => (
                <div
                    key={widget.id}
                    className={styles.cell}
                    style={{ '--_panneau-widget-span': widthOf(widget) } as CSSProperties}
                    data-widget={widget.id}
                >
                    <WidgetCodeSkeleton widget={widget} />
                </div>
            ))}
        </div>
    );
}

/**
 * A dashboard page while the code of the dashboards loads (#346): its title and the skeletons of
 * its widgets.
 */
export function DashboardSkeleton({
    definition,
    page = HOME_PAGE,
}: {
    definition: Definition;
    page?: string | undefined;
}) {
    const title =
        page === HOME_PAGE ? definition.name : labelOrKey(definition.pages?.[page]?.label, page);
    return (
        <PageLayout>
            <PageHeader title={title} />
            <DashboardGridSkeleton widgets={getDashboardWidgets(definition, page)} />
        </PageLayout>
    );
}
