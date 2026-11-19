import type { ReactNode } from 'react';

import { appMessages } from '@panneau/intl';
import type { Definition, Resource, ResourceSummary as Summary } from '@panneau/protocol';
import { type WidgetListQuery, followsPeriod } from '@panneau/protocol/runtime';
import { Disclosure, usePanneauIntl, usePreference } from '@panneau/ui';

import { DashboardGrid } from '../dashboard/Dashboard';
import { PeriodControl } from '../dashboard/PeriodControl';
import type { PeriodState } from '../dashboard/period';
import styles from './ResourceSummary.module.css';

/** Whether the summary is shown, as the browser remembers it. */
const SUMMARY_STATES = ['open', 'closed'] as const;

/** The key under which the browser remembers whether the summary of a resource is shown. */
export function summaryPreferenceKey(resource: string): string {
    return `summary:${resource}`;
}

/** Whether the user hid the summary of a resource (decision 0084). Open until they do. */
export function useSummaryOpen(resource: string): [boolean, (open: boolean) => void] {
    const [state, setState] = usePreference(summaryPreferenceKey(resource), SUMMARY_STATES);
    return [state !== 'closed', (open) => setState(open ? 'open' : 'closed')];
}

export interface ResourceSummaryProps {
    resource: Resource;
    summary: Summary;
    definition: Definition;
    basePath: string;
    /** The current filters and search of the list, which the widgets that follow it get. */
    query: WidgetListQuery;
    /** Whether the summary is shown: `useSummaryOpen()`. */
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** The period of the summary, which is the list's date-range filter (decision 0084). */
    period?: PeriodState | undefined;
    /** At the end of its header, next to its title. */
    headerEnd?: ReactNode;
}

/**
 * The summary above the list of a resource (decision 0084): its widgets in the grid of a
 * dashboard, under a title that shows or hides them. Its widgets on the resource, and those with
 * data of their own, follow the filters and the search of the list.
 */
export function ResourceSummary({
    resource,
    summary,
    definition,
    basePath,
    query,
    isOpen,
    onOpenChange,
    period,
    headerEnd,
}: ResourceSummaryProps) {
    const intl = usePanneauIntl();
    const title = intl.formatMessage(appMessages.summary);
    return (
        <section className={styles.root} aria-label={title}>
            <Disclosure
                title={title}
                headingLevel={2}
                isExpanded={isOpen}
                onExpandedChange={onOpenChange}
                triggerClassName={styles.toggle}
                headerEnd={
                    (summary.period !== undefined && period !== undefined) ||
                    (headerEnd !== undefined && headerEnd !== null) ? (
                        <>
                            {summary.period !== undefined && period !== undefined ? (
                                <PeriodControl
                                    options={summary.period.options}
                                    value={period.option}
                                    onChange={period.choose}
                                    widgets={summary.widgets}
                                    following={summary.widgets.filter((widget) =>
                                        followsPeriod(widget, resource.id),
                                    )}
                                />
                            ) : null}
                            {headerEnd}
                        </>
                    ) : undefined
                }
            >
                {isOpen ? (
                    <DashboardGrid
                        widgets={summary.widgets}
                        summary={{ resource: resource.id, query }}
                        period={period?.period}
                        definition={definition}
                        basePath={basePath}
                    />
                ) : null}
            </Disclosure>
        </section>
    );
}
