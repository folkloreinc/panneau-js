import { usePanneau } from '@panneau/core';
import type { DataAdapter } from '@panneau/data';
import { useOptionalDataAdapter } from '@panneau/data/query';
import type { PresignedUploads } from '@panneau/data/uploads';
import type { Field, Uploads } from '@panneau/protocol';

const cache = new WeakMap<DataAdapter, Map<string, PresignedUploads>>();

/**
 * The direct uploads of an adapter, when the definition announces them (`"uploads": { "mode":
 * "presigned" }`) and the adapter can make them. The same object for the same adapter and
 * endpoint, so that uploaders aren't made again on every render.
 */
export function getPresignedUploads(
    adapter: DataAdapter | null,
    uploads: Uploads | null | undefined,
): PresignedUploads | null {
    if (
        adapter === null ||
        uploads?.mode !== 'presigned' ||
        adapter.presignedUploads === undefined
    ) {
        return null;
    }
    const key = uploads.endpoint ?? '';
    const byEndpoint = cache.get(adapter) ?? new Map<string, PresignedUploads>();
    cache.set(adapter, byEndpoint);
    let presigned = byEndpoint.get(key);
    if (presigned === undefined) {
        presigned = adapter.presignedUploads(
            uploads.endpoint !== undefined ? { endpoint: uploads.endpoint } : {},
        );
        byEndpoint.set(key, presigned);
    }
    return presigned;
}

/**
 * What the upload fields of a definition use: the adapter of `@panneau/data` (`DataAdapterProvider`)
 * and the direct uploads that the definition of `@panneau/core` (`PanneauProvider`) announces.
 * Both are null without their provider.
 */
export function useMediaServices(): {
    adapter: DataAdapter | null;
    uploads: PresignedUploads | null;
} {
    const adapter = useOptionalDataAdapter();
    const { definition } = usePanneau();
    return { adapter, uploads: getPresignedUploads(adapter, definition?.uploads) };
}

/** The accepted MIME types of a field: its `accept`, or its `accept` rule. */
export function getAccept(field: Field): string[] | null {
    if (field.accept !== undefined && field.accept.length > 0) {
        return field.accept;
    }
    const rule = field.rules?.find((candidate) => candidate.rule === 'accept');
    return rule !== undefined && Array.isArray(rule.value) ? rule.value.map(String) : null;
}

/** The largest file of a field, in bytes: its `maxSize` rule. */
export function getMaxSize(field: Field): number | null {
    const rule = field.rules?.find((candidate) => candidate.rule === 'maxSize');
    return rule !== undefined && typeof rule.value === 'number' ? rule.value : null;
}
