import type { Definition, Resource } from '@panneau/protocol';

import { can } from './definition/abilities';

/**
 * A command of the "Go to…" palette that a plugin adds (decision 0029): a link to follow or a
 * function to run, found by its label, description and keywords.
 */
export interface Command {
    /** Unique among the commands of the palette. */
    id: string;
    label: string;
    /** The group it is listed in. Defaults to the palette's group of commands. */
    group?: string;
    description?: string;
    /** More words it is found by. */
    keywords?: readonly string[];
    /** A Lucide icon name (`"send"`). */
    icon?: string;
    /** A path of the app, or a URL, to go to. */
    href?: string;
    /** What it does, without an `href`. */
    perform?: () => void;
}

/** What a plugin's commands can depend on. */
export interface CommandContext {
    /** The definition for the current user, or `null` outside of the app. */
    definition: Definition | null;
}

/** Commands, or a function that makes them for the current definition. */
export type CommandSource = readonly Command[] | ((context: CommandContext) => readonly Command[]);

/** The commands of every source, in order. */
export function getCommands(sources: readonly CommandSource[], context: CommandContext): Command[] {
    return sources.flatMap((source) => (typeof source === 'function' ? source(context) : source));
}

/**
 * Whether a resource is in the global search: its `features.search`, or, without it, whether its
 * list has a search (`list.search`), so one setting serves both (decision 0029).
 */
export function isSearchable(resource: Resource): boolean {
    return resource.features?.search ?? resource.list?.search ?? false;
}

/** The resources of the global search that the user can list. */
export function getSearchableResources(definition: Definition): Resource[] {
    return definition.resources.filter(
        (resource) => isSearchable(resource) && can(resource.abilities, 'viewAny'),
    );
}
