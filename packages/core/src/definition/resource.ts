import type { Definition, Resource } from '@panneau/protocol';

import { can } from './abilities';
import { type ResolveFormOptions, type ResolvedForm, resolveForm } from './form';
import { type ResolvedList, resolveList } from './list';

/** What the current user can do with a resource as a whole. */
export interface ResourceAbilities {
    viewAny: boolean;
    create: boolean;
}

/** A resource with its form, its list and its abilities resolved. */
export interface ResolvedResource {
    resource: Resource;
    /** The form to create an item. Use `resolveForm()` for an update, or an item type. */
    form: ResolvedForm;
    list: ResolvedList;
    abilities: ResourceAbilities;
}

/** Resolves a resource into its form, its list and its abilities. */
export function resolveResource(
    resource: Resource,
    formOptions: ResolveFormOptions = { mode: 'create' },
): ResolvedResource {
    return {
        resource,
        form: resolveForm(resource, formOptions),
        list: resolveList(resource),
        abilities: {
            viewAny: can(resource.abilities, 'viewAny'),
            create: can(resource.abilities, 'create'),
        },
    };
}

/** Finds a resource of a definition by id. */
export function findResource(definition: Definition, id: string): Resource | undefined {
    return definition.resources.find((resource) => resource.id === id);
}
