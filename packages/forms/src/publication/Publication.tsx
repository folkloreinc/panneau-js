import { useId, useState } from 'react';

import { selectValue } from '@panneau/core';
import type { Option } from '@panneau/protocol';
import { Badge, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Form.module.css';
import { useFormState } from '../context';
import type { LayoutComponentProps } from '../layout/Layout';
import { messages } from '../messages';

export interface PublicationProps extends LayoutComponentProps {
    /** The field that says whether the item is published, a `boolean`. Defaults to `published`. */
    published?: string;
    /** The field of the publication date, a `date` or a `datetime`. Defaults to `published_at`. */
    publishedAt?: string;
    /** The field of the status, a `select` whose options have tones. Defaults to `status`. */
    status?: string;
}

interface PublicationState {
    label: string;
    tone: Tone;
    /** "Published on Nov 3, 2026", or `null` without a date. */
    detail: string | null;
}

function toDate(value: unknown): Date | null {
    if (typeof value !== 'string' || value === '') {
        return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The publication of an item (decision 0065): a `component` node of the form layout that frames
 * the fields of its children (whether it is published, its date, its status) under a summary of
 * the state, `Published`, `Scheduled` or `Not published`, with its date. A status with an option
 * gives the state its label and tone. The fields stay at the top of the resource, where lists can
 * filter and sort them.
 *
 * ```jsonc
 * { "type": "component", "component": "publication", "children": [
 *     { "type": "field", "name": "published" },
 *     { "type": "field", "name": "published_at" },
 *     { "type": "field", "name": "status" }
 * ] }
 * ```
 */
export function Publication({
    node,
    form,
    fields,
    children,
    published = 'published',
    publishedAt = 'published_at',
    status = 'status',
}: PublicationProps) {
    const intl = usePanneauIntl();
    const state = useFormState(form);
    const titleId = useId();
    const [now] = useState(() => Date.now());
    const isPublished = selectValue(state, published);
    const date = toDate(selectValue(state, publishedAt));
    const statusValue = selectValue(state, status);
    const option: Option | undefined = fields
        .get(status)
        ?.options?.find((candidate) => String(candidate.value) === String(statusValue));
    const formatted = date !== null ? intl.formatDate(date, { dateStyle: 'medium' }) : null;
    const scheduled = date !== null && date.getTime() > now;
    const live = isPublished === true || (isPublished === undefined && date !== null);
    let summary: PublicationState;
    if (live && scheduled) {
        summary = {
            label: intl.formatMessage(messages.publication.scheduled),
            tone: 'info',
            detail:
                formatted !== null
                    ? intl.formatMessage(messages.publication.scheduledFor, { date: formatted })
                    : null,
        };
    } else if (live) {
        summary = {
            label: intl.formatMessage(messages.publication.published),
            tone: 'success',
            detail:
                formatted !== null
                    ? intl.formatMessage(messages.publication.publishedOn, { date: formatted })
                    : null,
        };
    } else {
        summary = {
            label: intl.formatMessage(messages.publication.unpublished),
            tone: 'neutral',
            detail: null,
        };
    }
    if (option !== undefined) {
        // The status of the site says more than the published flag: "Draft", "In review".
        summary = {
            ...summary,
            label: option.label,
            tone: (option.tone as Tone | undefined) ?? 'neutral',
        };
    }
    return (
        <section className={styles.section} aria-labelledby={titleId}>
            <div className={styles.sectionHeader}>
                <h3 id={titleId} className={styles.sectionTitle}>
                    {node.label ?? intl.formatMessage(messages.publication.title)}
                    <Badge tone={summary.tone}>{summary.label}</Badge>
                </h3>
                {summary.detail !== null ? (
                    <p className={styles.sectionDescription}>{summary.detail}</p>
                ) : null}
            </div>
            {children}
        </section>
    );
}

/** The `publication` layout component, as a `@panneau/core` plugin. */
export const publicationPlugin = {
    id: 'panneau.publication',
    components: { publication: Publication },
};
