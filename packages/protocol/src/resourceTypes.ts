/** The key of an item, and of the body of a create, that holds its type. */
export const ITEM_TYPE_KEY = 'type';

/** Whether a resource has types: its items each have one, chosen when they are created. */
export function hasResourceTypes(resource: { types?: readonly unknown[] | undefined }): boolean {
    return (resource.types?.length ?? 0) > 0;
}

/** The type of a resource with this id, or `undefined` for one it doesn't have. */
export function getResourceType<T extends { id: string }>(
    resource: { types?: readonly T[] | undefined },
    id: unknown,
): T | undefined {
    return typeof id === 'string' ? resource.types?.find((type) => type.id === id) : undefined;
}

/** The type of an item, read from its `type`, or `undefined` when its resource doesn't have it. */
export function getItemType<T extends { id: string }>(
    resource: { types?: readonly T[] | undefined },
    item: Readonly<Record<string, unknown>>,
): T | undefined {
    return getResourceType(resource, item[ITEM_TYPE_KEY]);
}

/**
 * The types a user can create items of, in order: those without `abilities.create: false`. Empty
 * for a resource without types.
 */
export function getCreatableTypes<
    T extends { abilities?: Record<string, boolean> | undefined },
>(resource: { types?: readonly T[] | undefined }): T[] {
    return (resource.types ?? []).filter((type) => type.abilities?.create !== false);
}

/**
 * The fields of the items of a type: those of the resource, then those of the type. Only the
 * resource's fields without a type, or for one it doesn't have.
 */
export function getTypeFields<F>(
    resource: {
        fields: readonly F[];
        types?: readonly { id: string; fields: readonly F[] }[] | undefined;
    },
    type: unknown,
): F[] {
    const found = getResourceType(resource, type);
    return [...resource.fields, ...(found?.fields ?? [])];
}
