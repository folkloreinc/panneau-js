// The uploads of a mock backend, and the files and media of the values it receives.
import { getMediaLibraries } from '../libraries';
import type { ResourceInput } from '../schemas';
import type {
    MediaInfo,
    MediaReference,
    StoredFile,
    Upload,
    UploadSignResponse,
} from '../schemas/api';
import { isRecord } from '../values';
import { json, problem } from './http';
import { mediaOf } from './items';
import type { MockState } from './state';
import type { Values } from './types';

/** Direct uploads, and the files and media that the values of an item refer to. */
export function createMockUploads(state: MockState) {
    const { definition, store } = state;
    // Direct uploads: the open uploads by id, with their key. The mock signs fake URLs, and
    // trusts the client when it completes an upload.
    const uploads = new Map<string, Upload>();
    let nextUpload = 1;

    const handleUploads = async (
        segments: string[],
        method: string,
        readBody: () => Promise<Values>,
    ): Promise<Response> => {
        if (definition.uploads?.mode !== 'presigned') {
            return problem(404, 'Not found.');
        }
        if (method !== 'POST') {
            return problem(405, 'Method not allowed.');
        }
        if (segments.length === 2 && segments[1] === 'sign') {
            const body = await readBody();
            const opens =
                body.uploadId === undefined && (body.method === 'POST' || body.method === 'PUT');
            if (opens) {
                const id = `upl_${nextUpload++}`;
                const upload: Upload = { id, key: `uploads/${id}` };
                uploads.set(id, upload);
                const response: UploadSignResponse = {
                    url: `https://storage.test/${upload.key}?signature=mock`,
                    key: upload.key,
                    upload: id,
                };
                return json(200, response);
            }
            const upload = [...uploads.values()].find((candidate) => candidate.key === body.key);
            if (upload === undefined) {
                return problem(404, 'Upload not found.');
            }
            return json(200, { url: `https://storage.test/${upload.key}?signature=mock` });
        }
        if (segments.length === 3 && segments[2] === 'complete' && segments[1] !== undefined) {
            const upload = uploads.get(segments[1]);
            if (upload === undefined) {
                return problem(404, 'Upload not found.');
            }
            const { name } = await readBody();
            if (typeof name === 'string') {
                upload.name = name;
            }
            return json(200, { data: upload });
        }
        return problem(404, 'Not found.');
    };

    // The values of `file` fields at the top of a resource: an upload becomes a stored file, and
    // a stored file or null is kept. Returns the paths of uploads that don't exist.
    const resolveFiles = (
        resource: ResourceInput,
        values: Values,
    ): { values: Values; missing: string[] } => {
        const missing: string[] = [];
        const resolved = { ...values };
        const toFile = (value: unknown, path: string): unknown => {
            if (!isRecord(value) || typeof value.upload !== 'string') {
                return value;
            }
            const upload = uploads.get(value.upload);
            if (upload === undefined) {
                missing.push(path);
                return value;
            }
            const file: StoredFile = {
                name: upload.name ?? (typeof value.name === 'string' ? value.name : upload.id),
                url: `https://storage.test/${upload.key ?? upload.id}`,
                mime: upload.mime ?? (typeof value.mime === 'string' ? value.mime : null),
                size: upload.size ?? (typeof value.size === 'number' ? value.size : null),
            };
            return file;
        };
        resource.fields
            .filter((field) => field.type === 'file' && field.name in values)
            .forEach((field) => {
                const value = values[field.name];
                resolved[field.name] = Array.isArray(value)
                    ? value.map((entry, index) => toFile(entry, `${field.name}.${String(index)}`))
                    : toFile(value, field.name);
            });
        return { values: resolved, missing };
    };

    const missingMedia = (paths: Record<string, string>) =>
        problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                Object.entries(paths).map(([path, message]) => [path, [message]]),
            ),
        });

    const missingUploads = (paths: string[]) =>
        problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                paths.map((path) => [path, ['This upload does not exist.']]),
            ),
        });

    // The values of `media` and `image` fields at the top of a resource: an id, or
    // `{ id, resource, transform }`, becomes a reference to a media of one of its libraries. A
    // field that allows several libraries needs the library of each media (decision 0027).
    // Returns the problems by path.
    const resolveMedia = (
        resource: ResourceInput,
        values: Values,
    ): { values: Values; missing: Record<string, string> } => {
        const missing: Record<string, string> = {};
        const resolved = { ...values };
        resource.fields
            .filter(
                (field) =>
                    (field.type === 'media' || field.type === 'image') && field.name in values,
            )
            .forEach((field) => {
                const allowed = getMediaLibraries(definition, field);
                const toReference = (value: unknown, path: string): unknown => {
                    const id = isRecord(value) ? value.id : value;
                    if (typeof id !== 'string' && typeof id !== 'number') {
                        return value;
                    }
                    const named =
                        isRecord(value) && typeof value.resource === 'string'
                            ? value.resource
                            : undefined;
                    if (named === undefined && allowed.length > 1) {
                        missing[path] = 'This field allows several libraries: name the library.';
                        return value;
                    }
                    const libraryId = named ?? allowed[0];
                    const library = definition.resources.find(
                        (candidate) => candidate.id === libraryId && allowed.includes(candidate.id),
                    );
                    const media = (store.get(library?.id ?? '') ?? []).find(
                        (candidate) => candidate.id === String(id),
                    );
                    if (media === undefined || library === undefined) {
                        missing[path] = 'This media does not exist.';
                        return value;
                    }
                    const title = media[library.itemTitle ?? 'name'];
                    const reference: MediaReference = {
                        id: media.id,
                        ...(allowed.length > 1 ? { resource: library.id } : {}),
                        ...(typeof title === 'string' ? { label: title } : {}),
                        ...(isRecord(media.media) ? { media: media.media as MediaInfo } : {}),
                        ...(isRecord(value) && isRecord(value.transform)
                            ? { transform: value.transform }
                            : {}),
                    };
                    return reference;
                };
                const value = values[field.name];
                resolved[field.name] = Array.isArray(value)
                    ? value.map((entry, index) =>
                          toReference(entry, `${field.name}.${String(index)}`),
                      )
                    : toReference(value, field.name);
            });
        return { values: resolved, missing };
    };

    // Resolves the files and media of the values, and computes the `media` of a media item from
    // its file. The client never sets `media`.
    const resolveValues = (
        resource: ResourceInput,
        body: Values,
    ): { values: Values; problem: Response | null } => {
        const sent = { ...body };
        if (resource.kind === 'media') {
            delete sent.media;
        }
        const files = resolveFiles(resource, sent);
        if (files.missing.length > 0) {
            return { values: body, problem: missingUploads(files.missing) };
        }
        const media = resolveMedia(resource, files.values);
        if (Object.keys(media.missing).length > 0) {
            return { values: body, problem: missingMedia(media.missing) };
        }
        const values = media.values;
        if (resource.kind === 'media' && isRecord(values.file)) {
            values.media = mediaOf(values.file as StoredFile);
        }
        return { values, problem: null };
    };

    return { handleUploads, resolveValues };
}
