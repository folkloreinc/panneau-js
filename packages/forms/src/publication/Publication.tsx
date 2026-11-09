import { useId, useState } from 'react';

import { type Form, type FormState, selectValue } from '@panneau/core';
import type { Field, Option } from '@panneau/protocol';
import { Badge, Button, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Form.module.css';
import { useFormState } from '../context';
import type { LayoutComponentProps } from '../layout/Layout';
import { messages } from '../messages';
import type { FormPanelProps } from '../panels/panels';

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

interface PublicationNames {
    published: string;
    publishedAt: string;
    status: string;
}

/** The state of the publication of the form's item, from the values of its fields. */
function usePublicationSummary(
    form: Form,
    fields: ReadonlyMap<string, Field>,
    { published, publishedAt, status }: PublicationNames,
): { summary: PublicationState; state: FormState; live: boolean } {
    const intl = usePanneauIntl();
    const state = useFormState(form);
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
    return { summary, state, live };
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
    const titleId = useId();
    const { summary } = usePublicationSummary(form, fields, { published, publishedAt, status });
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

export interface PublicationPanelProps extends FormPanelProps {
    /** The field that says whether the item is published, a `boolean`. Defaults to `published`. */
    published?: string;
    /** The field of the publication date, a `date` or a `datetime`. Defaults to `published_at`. */
    publishedAt?: string;
    /** The field of the status, a `select`. Defaults to `status`. */
    status?: string;
    /** The status that Publish sets, without a `published` field. Defaults to `published`. */
    publishedStatus?: string;
    /** The status that Unpublish sets, without a `published` field. Defaults to `draft`. */
    draftStatus?: string;
}

/** Now, as the value of a `date` field (`2026-11-09`, local) or of a `datetime` one (ISO). */
function nowValue(field: Field): string {
    const date = new Date();
    if (field.type === 'date') {
        const pad = (value: number) => String(value).padStart(2, '0');
        return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * The `publication` panel of a form's sidebar (decision 0075): the state of the item, as the
 * `publication` component shows it, its fields, and a Publish button, or Unpublish once it is
 * published, which sets the publication and saves. Publishing sets `published` to `true`, or else
 * the status to `publishedStatus`, and the date to now when it is empty. Without a `published`
 * field nor a status with the option, the panel has no button.
 */
export function PublicationPanel({
    form,
    fields,
    children,
    published = 'published',
    publishedAt = 'published_at',
    status = 'status',
    publishedStatus = 'published',
    draftStatus = 'draft',
}: PublicationPanelProps) {
    const intl = usePanneauIntl();
    const { summary, state, live } = usePublicationSummary(form, fields, {
        published,
        publishedAt,
        status,
    });
    const publishedField = fields.get(published);
    const statusField = fields.get(status);
    const dateField = fields.get(publishedAt);
    const hasStatus = (value: string) =>
        statusField?.options?.some((option) => String(option.value) === value) === true;
    const byFlag = publishedField !== undefined;
    const byStatus = !byFlag && hasStatus(publishedStatus);
    const isLive = byFlag
        ? selectValue(state, published) === true
        : byStatus
          ? String(selectValue(state, status)) === publishedStatus
          : live;
    const toggle = () => {
        if (byFlag) {
            form.setValue(published, !isLive);
        } else if (byStatus) {
            form.setValue(status, isLive ? draftStatus : publishedStatus);
        }
        if (!isLive && dateField !== undefined && toDate(form.getValue(publishedAt)) === null) {
            form.setValue(publishedAt, nowValue(dateField));
        }
    };
    return (
        <div className={styles.stack}>
            <div className={styles.publicationState}>
                <Badge tone={summary.tone}>{summary.label}</Badge>
                {summary.detail !== null ? (
                    <span className={styles.sectionDescription}>{summary.detail}</span>
                ) : null}
            </div>
            {children}
            {byFlag || byStatus ? (
                // A submit button: the form saves with the publication it just set
                <Button
                    type="submit"
                    tone={isLive ? 'neutral' : 'accent'}
                    appearance={isLive ? 'outline' : 'solid'}
                    isPending={state.status === 'submitting'}
                    onPress={toggle}
                >
                    {intl.formatMessage(
                        isLive ? messages.publication.unpublish : messages.publication.publish,
                    )}
                </Button>
            ) : null}
        </div>
    );
}

/** The `publication` layout component and panel, as a `@panneau/core` plugin. */
export const publicationPlugin = {
    id: 'panneau.publication',
    components: { publication: Publication },
    panels: { publication: PublicationPanel },
};
