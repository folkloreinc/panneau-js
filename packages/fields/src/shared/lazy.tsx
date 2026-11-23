import { Suspense, lazy } from 'react';

import { getFieldLabel } from '@panneau/protocol/runtime';
import { LoadingRegion, Skeleton } from '@panneau/ui';

import styles from './FieldEntrySkeleton.module.css';
import type { FieldEntry, FieldEntryProps } from './types';

/** The height of the control of a type, while its code loads: one line, unless it says otherwise. */
const HEIGHTS: Readonly<Record<string, string>> = {
    json: '8rem',
    file: '6rem',
    location: '16rem',
    address: '12rem',
    embed: '6rem',
    link: '6rem',
};

/**
 * A field whose code loads (decision 0034): its label, unless it is hidden, and a block of the
 * height of its control.
 */
export function FieldEntrySkeleton({
    field,
    hideLabel,
}: Pick<FieldEntryProps, 'field' | 'hideLabel'>) {
    const label = getFieldLabel(field);
    return (
        <LoadingRegion className={styles.root}>
            {hideLabel === true ? null : (
                <Skeleton
                    className={styles.label}
                    width={`${String(Math.max(4, Math.min(label.length, 40)))}ch`}
                />
            )}
            <Skeleton
                shape="rect"
                height={HEIGHTS[field.type] ?? 'var(--panneau-control-height)'}
            />
        </LoadingRegion>
    );
}

/**
 * A field entry whose component loads on first use, with the skeleton of the field until then
 * (#346). The built-in types with heavy code (phone numbers, maps, links, addresses…) are loaded
 * this way, so that the forms without them don't load it. Plugins can do the same for theirs:
 *
 * ```ts
 * const fields = { chart: lazyFieldEntry(async () => (await import('./ChartField')).ChartFieldEntry) };
 * ```
 */
export function lazyFieldEntry(load: () => Promise<FieldEntry>): FieldEntry {
    const Loaded = lazy(async () => ({ default: await load() }));
    return function LazyFieldEntry(props: FieldEntryProps) {
        return (
            <Suspense
                fallback={<FieldEntrySkeleton field={props.field} hideLabel={props.hideLabel} />}
            >
                <Loaded {...props} />
            </Suspense>
        );
    };
}
