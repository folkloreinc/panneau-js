import { ChevronDown } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { Button, Heading } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition, Resource, ResourceSummary as Summary } from '@panneau/protocol';
import type { WidgetListQuery } from '@panneau/protocol/runtime';
import { Icon, usePanneauIntl, usePreference } from '@panneau/ui';

import { DashboardGrid } from '../dashboard/Dashboard';
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
    headerEnd,
}: ResourceSummaryProps) {
    const intl = usePanneauIntl();
    const titleId = useId();
    const contentId = useId();
    return (
        <section className={styles.root} aria-labelledby={titleId}>
            <div className={styles.header}>
                <Heading level={2} className={styles.heading} id={titleId}>
                    <Button
                        className={styles.toggle}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onPress={() => onOpenChange(!isOpen)}
                    >
                        <Icon icon={ChevronDown} size="sm" className={styles.chevron} />
                        {intl.formatMessage(appMessages.summary)}
                    </Button>
                </Heading>
                {headerEnd}
            </div>
            <div id={contentId} hidden={!isOpen}>
                {isOpen ? (
                    <DashboardGrid
                        widgets={summary.widgets}
                        summary={{ resource: resource.id, query }}
                        definition={definition}
                        basePath={basePath}
                    />
                ) : null}
            </div>
        </section>
    );
}
