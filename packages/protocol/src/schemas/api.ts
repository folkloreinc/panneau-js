import { z } from 'zod';

import { Abilities, Id, RouteReference } from './common';
import { User } from './definition';

export const Item = z
    .looseObject({
        id: Id,
        version: z.string().nullable().meta({
            description: 'Changes on every update. `null` when the backend has no versions.',
        }),
        abilities: Abilities,
    })
    .meta({
        description: 'An item of a resource. Its other properties are the values of its fields.',
    });

export const Pagination = z.looseObject({
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    lastPage: z.number().int().positive(),
});

export const CursorPagination = z
    .looseObject({
        perPage: z.number().int().positive(),
        nextCursor: z.string().min(1).nullable().meta({
            description: 'The `cursor` of the next page, or `null` on the last page.',
        }),
        previousCursor: z.string().min(1).nullable().optional().meta({
            description:
                'The `cursor` of the previous page, or `null` when it is the first page, which has none (and on the first page). Without it, clients go back through the cursors they followed.',
        }),
        total: z.number().int().nonnegative().nullable().optional().meta({
            description: 'How many items match, when the backend counts them.',
        }),
    })
    .meta({
        description:
            'The meta of a page of a list whose `pagination` is `cursor`: no page numbers, and no total unless the backend has one.',
    });

export const ItemResponse = z.looseObject({ data: Item });

export const ListResponse = z.looseObject({
    data: z.array(Item),
    meta: z.union([Pagination, CursorPagination]),
});

export const Problem = z
    .looseObject({
        type: z.string().meta({ description: 'A URI reference that identifies the problem type.' }),
        title: z.string(),
        status: z.number().int().min(400).max(599),
        detail: z.string().optional(),
        instance: z.string().optional(),
        errors: z
            .record(z.string(), z.array(z.string()))
            .optional()
            .meta({ description: '`422`: messages keyed by the dot path of the invalid value.' }),
        current: Item.optional().meta({ description: '`412`: the current version of the item.' }),
    })
    .meta({ description: 'An error, as RFC 9457 problem details (`application/problem+json`).' });

export const Selection = z.union([
    z.looseObject({ ids: z.array(Id).min(1) }),
    z.looseObject({
        query: z.looseObject({
            filter: z.record(z.string(), z.unknown()).optional().meta({
                description:
                    'The `filter` of the list query, by filter id: a value, a list of values, or the bounds of a range (`{ "from": "2026-01-01", "to": "2026-01-31" }`).',
            }),
            q: z.string().optional(),
        }),
        except: z.array(Id).optional(),
    }),
]);

export const ActionRequest = z.looseObject({
    selection: Selection.optional().meta({
        description: 'Omitted for actions on the whole resource.',
    }),
    values: z.record(z.string(), z.unknown()).optional(),
    dryRun: z.boolean().optional().meta({
        description:
            'Answer what the action would do without running it: a `200` action result whose `summary` counts the items that would succeed and those that would be skipped. Only for actions with `dryRun: true`.',
    }),
});

export const ActionItemResult = z.looseObject({
    id: Id,
    status: z.enum(['failed', 'skipped']),
    message: z.string().optional(),
    reason: z
        .string()
        .optional()
        .meta({ description: '`skipped`: `forbidden`, `not_found` or `unchanged`.' }),
});

export const ActionResult = z.looseObject({
    message: z.string().optional(),
    summary: z
        .looseObject({
            succeeded: z.number().int().nonnegative(),
            failed: z.number().int().nonnegative(),
            skipped: z.number().int().nonnegative(),
        })
        .optional(),
    results: z
        .array(ActionItemResult)
        .optional()
        .meta({ description: 'The items that did not succeed.' }),
    refresh: z.enum(['none', 'items', 'list']).optional(),
    redirect: z.union([z.string(), RouteReference]).nullable().optional(),
    download: z
        .looseObject({
            url: z.string(),
            filename: z.string().optional(),
            expiresAt: z.string().optional(),
        })
        .nullable()
        .optional(),
});

export const ActionRun = z.looseObject({
    id: Id,
    action: z.string(),
    resource: z.string(),
    status: z.enum(['queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled']),
    progress: z.number().int().nonnegative(),
    total: z.number().int().nonnegative().nullable(),
    result: ActionResult.optional().meta({ description: 'Set once the run has finished.' }),
    createdAt: z.string().optional(),
    finishedAt: z.string().nullable().optional(),
});

export const ActionRunResponse = z.looseObject({ run: ActionRun });

export const MediaTransform = z
    .looseObject({
        crop: z
            .looseObject({
                x: z.number().int().nonnegative(),
                y: z.number().int().nonnegative(),
                width: z.number().int().positive(),
                height: z.number().int().positive(),
            })
            .optional()
            .meta({
                description:
                    'In whole pixels of the upright original image (after its EXIF orientation), from its top left corner.',
            }),
        rotate: z
            .union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)])
            .optional()
            .meta({ description: 'Clockwise, in degrees.' }),
        flipX: z.boolean().optional().meta({ description: 'Mirrors left to right (horizontal).' }),
        flipY: z.boolean().optional().meta({ description: 'Mirrors top to bottom (vertical).' }),
        focalPoint: z
            .looseObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
            .optional()
            .meta({
                description:
                    'From 0 to 1, relative to the width and height of the upright original image, not of the crop: changing the crop does not move it. Renderers map it into the transformed image and clamp it to the crop.',
            }),
        base: z.enum(['media', 'original']).optional().meta({
            description:
                "What a transform for one use starts from: the original file by default, or the media's own transform (`media`). With `media`, the crop and the focal point are relative to the media's version instead of the original (decision 0031).",
        }),
        // Return types are written out so that declaration files keep the recursion.
        get baseTransform(): z.ZodOptional<typeof MediaTransform> {
            return MediaTransform.optional().meta({
                description:
                    'With `base: "media"`: the media\'s own transform this one was made on. When the media\'s transform is no longer the same, clients ask to check the crop, and renderers clamp it.',
            });
        },
    })
    .meta({
        description:
            "Non-destructive edits of an image, applied in this order: crop, then rotate, then flip. Renderers ignore the keys they don't know, which editor tools can add.",
    });

export const UploadReference = z.looseObject({ upload: z.string().min(1) }).meta({
    description:
        'A file uploaded directly to storage, by the id of its upload: in a file value, such as the `file` of a media, or an action parameter.',
});

export const StoredFile = z
    .looseObject({
        name: z.string().meta({ description: 'The name of the file, as the user knows it.' }),
        url: z.string().nullable().optional().meta({
            description: 'Where to download it. A private file gets a temporary URL.',
        }),
        mime: z.string().nullable().optional(),
        size: z.number().int().nonnegative().nullable().optional(),
    })
    .meta({
        description:
            'A file stored by the backend: the value of a `file` field in items. Requests send it back to keep the file, `{ "upload" }` to replace it, or `null` to remove it.',
    });

export const Upload = z
    .looseObject({
        id: z.string().min(1).meta({ description: 'The id of the upload: `upl_…`.' }),
        key: z.string().optional().meta({ description: 'The key of the object in storage.' }),
        name: z.string().optional(),
        mime: z.string().optional(),
        size: z.number().int().nonnegative().optional(),
    })
    .meta({
        description:
            'A file the browser uploaded to storage, before it becomes a media, an import or another value.',
    });

export const UploadResponse = z.looseObject({ data: Upload });

export const UploadSignRequest = z
    .looseObject({
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
        key: z.string().min(1),
        uploadId: z.string().optional().meta({ description: 'The S3 multipart upload.' }),
        partNumber: z.number().int().positive().optional(),
        contentType: z.string().optional(),
        expiresIn: z.number().int().positive().optional(),
    })
    .meta({
        description: "A request of the browser's S3 client to sign (Uppy 6's `signRequest`).",
    });

export const UploadSignResponse = z
    .looseObject({
        url: z.string(),
        key: z
            .string()
            .optional()
            .meta({ description: 'The key the backend chose, for the first request of a file.' }),
        headers: z.record(z.string(), z.string()).optional().meta({
            description: 'Headers the URL was signed with, which the browser sends.',
        }),
        upload: z
            .string()
            .optional()
            .meta({ description: 'The upload the first request of a file created: `upl_…`.' }),
    })
    .meta({ description: 'A presigned request.' });

export const MediaInfo = z
    .looseObject({
        type: z.string().meta({
            description:
                '`image`, `video`, `audio`, `document`, `font`, or another type the backend knows.',
        }),
        mime: z.string().nullable().optional(),
        size: z.number().int().nonnegative().nullable().optional(),
        url: z.string().nullable().optional().meta({
            description:
                'The main file to show or play: a rendition, or the original until it exists.',
        }),
        thumbnailUrl: z.string().nullable().optional(),
        variants: z
            .record(
                z.string(),
                z.looseObject({
                    url: z.string(),
                    width: z.number().optional(),
                    height: z.number().optional(),
                }),
            )
            .optional()
            .meta({ description: 'Named renditions: sizes of an image, qualities of a video.' }),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        duration: z.number().nullable().optional().meta({ description: 'In seconds.' }),
        status: z.enum(['pending', 'processing', 'ready', 'failed']).optional().meta({
            description:
                'Where the processing of the file is: `pending` and `processing` until its renditions are made, then `ready` or `failed`. Without it, the media is ready.',
        }),
        error: z
            .looseObject({
                code: z.string().meta({
                    description:
                        'The code of the step that failed, such as a transcoder task code (`timeout`, `input_unreadable`).',
                }),
                message: z.string().optional().meta({ description: 'Why it failed, for people.' }),
            })
            .nullable()
            .optional()
            .meta({
                description:
                    "Why the processing failed, when `status` is `failed`, so that editors see it without the backend's monitoring.",
            }),
        metadata: z.record(z.string(), z.unknown()).optional(),
        transform: MediaTransform.nullable().optional().meta({
            description:
                "The media's own transform, from its library, which clients need to draw a transform for one use made over it (decision 0031).",
        }),
    })
    .meta({
        description:
            'What the backend computed about the file of a media item: the `media` of the items of a `media` resource, and of the values of `media` fields. Read-only: the editable properties of a media are the fields of its resource.',
    });

export const MediaItem = Item.extend({
    media: MediaInfo,
}).meta({
    description:
        'An item of a resource of kind `media`: the values of its fields (`file`, the original, and those of the project), and the `media` the backend computed.',
});

export const MediaReference = z
    .looseObject({
        id: Id,
        resource: z.string().optional().meta({
            description:
                'The library of the media. Required for a field that allows several libraries, since ids are unique only within their resource (decision 0027).',
        }),
        label: z.string().optional().meta({ description: 'The `itemTitle` of the media.' }),
        media: MediaInfo.optional(),
        transform: MediaTransform.nullable().optional().meta({
            description:
                'The edits of the image for this use only: from the original file, or over the media\'s own transform with `base: "media"`.',
        }),
    })
    .meta({
        description:
            'The value of a `media` or `image` field in items: the media, with what lists and fields show, and its edits for this use. Requests send the id, or `{ id, resource, transform }`: `resource` is required when the field allows several libraries.',
    });

export const FieldCheckRequest = z
    .looseObject({
        value: z.string().meta({ description: 'The value to check, as it is typed.' }),
        locale: z
            .string()
            .optional()
            .meta({ description: 'The locale of the value, for a localized field.' }),
        id: Id.nullable()
            .optional()
            .meta({ description: 'The item being edited, or null when creating one.' }),
        values: z.record(z.string(), z.unknown()).optional().meta({
            description:
                "The form's current values, as they would be sent to save, for what the check depends on (a page's parent).",
        }),
    })
    .meta({ description: 'A value of a field with `check`, to check with the backend.' });

export const FieldCheckResponse = z
    .looseObject({
        available: z.boolean().meta({
            description:
                'Whether no other item of the resource, in its scope and the same locale, has the value.',
        }),
        suggestion: z.string().nullable().optional().meta({
            description: 'An available value close to the one checked, when it is taken.',
        }),
        prefix: z.string().nullable().optional().meta({
            description: 'What the field shows in front of the value: the start of its URL.',
        }),
        url: z
            .string()
            .nullable()
            .optional()
            .meta({ description: 'The URL the value gives the item, which the field links to.' }),
        disabled: z.boolean().optional().meta({
            description:
                "The field doesn't apply to this item (the home page has no slug): the field is read-only.",
        }),
    })
    .meta({
        description:
            'What the backend says about a value: not authoritative, since saving still validates it.',
    });

export const Session = z.looseObject({ user: User });

export const SearchResponse = z
    .looseObject({
        data: z.array(
            z.looseObject({
                resource: z.string().meta({ description: 'The id of the resource.' }),
                items: z.array(Item),
                total: z.number().int().nonnegative().optional().meta({
                    description:
                        'How many items of the resource match, when the backend counts them: the list of the resource, searched, shows them all.',
                }),
            }),
        ),
    })
    .meta({
        description:
            'The results of the global search: the resources with results, in the order of the definition.',
    });

export const PreviewResponse = z.looseObject({ url: z.string(), expiresAt: z.string().optional() });

export const EmbedValue = z
    .looseObject({
        url: z.string().meta({ description: 'The URL of the video, sound or post.' }),
        type: z.enum(['video', 'audio', 'photo', 'rich', 'link']).optional(),
        title: z.string().optional(),
        provider: z.string().optional().meta({ description: 'The name of the provider.' }),
        thumbnailUrl: z.string().optional(),
        html: z
            .string()
            .optional()
            .meta({ description: 'The HTML that embeds it, from the oEmbed of its provider.' }),
        width: z.number().optional(),
        height: z.number().optional(),
    })
    .meta({
        description:
            'The value of an `embed` field: its URL, and what the backend got from its oEmbed.',
    });

export const EmbedResponse = z.looseObject({ data: EmbedValue });

export const LocationValue = z
    .looseObject({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        address: z.string().optional(),
    })
    .meta({ description: 'The value of a `location` field: a point, and its address.' });

export type Item = z.infer<typeof Item>;
export type Pagination = z.infer<typeof Pagination>;
export type ItemResponse = z.infer<typeof ItemResponse>;
export type CursorPagination = z.infer<typeof CursorPagination>;
export type ListResponse = z.infer<typeof ListResponse>;
export type Problem = z.infer<typeof Problem>;
export type Selection = z.infer<typeof Selection>;
export type ActionRequest = z.infer<typeof ActionRequest>;
export type ActionItemResult = z.infer<typeof ActionItemResult>;
export type ActionResult = z.infer<typeof ActionResult>;
export type ActionRun = z.infer<typeof ActionRun>;
export type ActionRunResponse = z.infer<typeof ActionRunResponse>;
export type MediaTransform = z.infer<typeof MediaTransform>;
export type UploadReference = z.infer<typeof UploadReference>;
export type StoredFile = z.infer<typeof StoredFile>;
export type Upload = z.infer<typeof Upload>;
export type UploadResponse = z.infer<typeof UploadResponse>;
export type UploadSignRequest = z.infer<typeof UploadSignRequest>;
export type UploadSignResponse = z.infer<typeof UploadSignResponse>;
export type FieldCheckRequest = z.infer<typeof FieldCheckRequest>;
export type FieldCheckResponse = z.infer<typeof FieldCheckResponse>;
export type MediaInfo = z.infer<typeof MediaInfo>;
export type MediaItem = z.infer<typeof MediaItem>;
export type MediaReference = z.infer<typeof MediaReference>;
export type Session = z.infer<typeof Session>;
export type SearchResponse = z.infer<typeof SearchResponse>;
export type PreviewResponse = z.infer<typeof PreviewResponse>;
export type EmbedValue = z.infer<typeof EmbedValue>;
export type EmbedResponse = z.infer<typeof EmbedResponse>;
export type LocationValue = z.infer<typeof LocationValue>;
