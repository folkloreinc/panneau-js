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
