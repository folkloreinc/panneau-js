/** What `getMediaLibraries()` reads of a definition. */
export interface MediaLibrariesDefinition {
    resources: readonly { id: string; kind?: string | undefined }[];
}

/**
 * The ids of the libraries a `media` field allows (decision 0027), in the order of its `resource`:
 * the one it names, the ones it lists, or every resource of kind `media` of the definition when it
 * names none. Ids that aren't libraries are left out: `lintDefinition()` reports them.
 */
export function getMediaLibraries(
    definition: MediaLibrariesDefinition | null,
    field: { resource?: string | readonly string[] | undefined },
): string[] {
    const libraries = (definition?.resources ?? [])
        .filter((resource) => resource.kind === 'media')
        .map((resource) => resource.id);
    if (field.resource === undefined) {
        return libraries;
    }
    const named: readonly string[] =
        typeof field.resource === 'string' ? [field.resource] : field.resource;
    return named.filter((id) => libraries.includes(id));
}

/** What `getItemImageField()` reads of a resource. */
export interface ItemImageResource {
    kind?: string | undefined;
    itemImage?: string | undefined;
}

/**
 * The key of an item that holds its image (decision 0061): the resource's `itemImage`, or `media`
 * in a media library, whose items all have one. `undefined` for a resource without an image.
 */
export function getItemImageField(resource: ItemImageResource): string | undefined {
    return resource.itemImage ?? (resource.kind === 'media' ? 'media' : undefined);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The types of images that browsers show. A HEIC or TIFF original needs a thumbnail. */
const WEB_IMAGE_TYPES = new Set([
    'image/apng',
    'image/avif',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
]);

/**
 * Whether the URL of a media or a file is an image to show, from its `type` (a media's URL is
 * the file to show) or its `mime` (a file's URL is its original), when it says.
 */
function isImageSource(source: Record<string, unknown>): boolean {
    if (typeof source.type === 'string') {
        return source.type === 'image';
    }
    if (typeof source.mime === 'string') {
        return WEB_IMAGE_TYPES.has(source.mime.toLowerCase());
    }
    return true;
}

/**
 * The URL of an image value, such as the `itemImage` of an item (decision 0061): a media reference
 * or a media (its thumbnail, or the URL of an image), a stored file (the URL of an image that
 * browsers show), or a URL, and the first of a list. `null` for anything else, such as a PDF
 * without a thumbnail.
 */
export function getImageUrl(value: unknown): string | null {
    const first: unknown = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string') {
        return first !== '' ? first : null;
    }
    if (!isRecord(first)) {
        return null;
    }
    const source = isRecord(first.media) ? first.media : first;
    const url = source.thumbnailUrl ?? (isImageSource(source) ? source.url : null);
    return typeof url === 'string' && url !== '' ? url : null;
}
