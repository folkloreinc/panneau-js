import { type ReactNode, createContext, use } from 'react';

import type { Definition } from '@panneau/protocol';

import { type ResolveFormOptions } from '../definition/form';
import { type ResolvedResource, findResource, resolveResource } from '../definition/resource';
import type { Router } from '../list/router';
import { type PanneauPlugin, type PluginRegistry, createPluginRegistry } from '../plugins';

/** What `PanneauProvider` gives to the hooks below it. */
export interface PanneauContextValue {
    plugins: PluginRegistry;
    /** The plugins as passed, including those of parent providers. */
    pluginList: readonly PanneauPlugin[];
    definition: Definition | null;
    router: Router | null;
}

const PanneauContext = createContext<PanneauContextValue | null>(null);

export interface PanneauProviderProps {
    /** Plugins, added after those of a parent provider (so they override them). */
    plugins?: readonly PanneauPlugin[];
    /** The definition, for `useResource()`. Defaults to the parent provider's. */
    definition?: Definition | null;
    /** The router that lists keep their query in. Defaults to the parent provider's. */
    router?: Router | null;
    children?: ReactNode;
}

/**
 * Provides plugins, the definition and the router to the hooks of `@panneau/core`. Providers can
 * be nested: a nested provider adds its plugins to those of its parent.
 */
export function PanneauProvider({
    plugins = [],
    definition,
    router,
    children,
}: PanneauProviderProps) {
    const parent = use(PanneauContext);
    const pluginList = [...(parent?.pluginList ?? []), ...plugins];
    const value: PanneauContextValue = {
        plugins: createPluginRegistry(pluginList),
        pluginList,
        definition: definition === undefined ? (parent?.definition ?? null) : definition,
        router: router === undefined ? (parent?.router ?? null) : router,
    };
    return <PanneauContext value={value}>{children}</PanneauContext>;
}

const EMPTY: PanneauContextValue = {
    plugins: createPluginRegistry([]),
    pluginList: [],
    definition: null,
    router: null,
};

/** The context of the closest `PanneauProvider`, or an empty one without a provider. */
export function usePanneau(): PanneauContextValue {
    return use(PanneauContext) ?? EMPTY;
}

/** The plugins of the closest `PanneauProvider`, merged. */
export function usePlugins(): PluginRegistry {
    return usePanneau().plugins;
}

/**
 * A resource of the definition, with its form, list and abilities resolved. Throws when there is
 * no definition or no such resource.
 */
export function useResource(id: string, formOptions?: ResolveFormOptions): ResolvedResource {
    const { definition } = usePanneau();
    if (definition === null) {
        throw new Error('useResource() needs a definition: pass one to <PanneauProvider>.');
    }
    const resource = findResource(definition, id);
    if (resource === undefined) {
        throw new Error(`The definition has no resource \`${id}\`.`);
    }
    return resolveResource(resource, formOptions);
}
