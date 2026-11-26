import type { Definition, Item, Resource } from '@panneau/protocol';
import { isSearchableResource } from '@panneau/protocol/runtime';

import { can } from './definition/abilities';
import type { ListSelection } from './list/list';

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
    /** What it does, without an `href`, with the context of the palette (decision 0116). */
    perform?: (context: CommandContext) => void;
    /**
     * Whether it applies to the current page (decision 0116). A command with `when` shows only
     * when it returns `true`, at the top of the palette; one without it shows in its group.
     */
    when?: (context: CommandContext) => boolean;
}

/** The page the palette opens over (decision 0116). */
export interface CommandPage {
    /** The name of the route of the app (`resource.index`, `resource.edit`, `page`…). */
    route: string;
    /** The resource of the page, when it has one. */
    resource?: Resource | undefined;
    /** The item of the page once loaded: the item of a form, or of the panel over a list. */
    item?: Item | undefined;
    /** The selection of a list page. */
    selection?: ListSelection | undefined;
}

/** What a plugin's commands can depend on. */
export interface CommandContext {
    /** The definition for the current user, or `null` outside of the app. */
    definition: Definition | null;
    /** The current page, or `null` (or left out) outside of a page of the app (decision 0116). */
    page?: CommandPage | null;
}

/** Commands, or a function that makes them for the current definition. */
export type CommandSource = readonly Command[] | ((context: CommandContext) => readonly Command[]);

/** The commands of every source, in order. */
export function getCommands(sources: readonly CommandSource[], context: CommandContext): Command[] {
    return sources.flatMap((source) => (typeof source === 'function' ? source(context) : source));
}

/**
 * Whether a command applies to the context: `true` without `when`, so that commands that don't
 * declare it keep their group (decision 0116).
 */
export function appliesTo(command: Command, context: CommandContext): boolean {
    return command.when === undefined || command.when(context);
}

/** Whether there are selected items in a selection: some ids, or every item matching. */
export function hasSelection(selection: ListSelection | undefined): boolean {
    return selection !== undefined && (selection.mode === 'all' || selection.ids.length > 0);
}

/**
 * Whether a resource is in the global search: its `features.search`, or, without it, whether its
 * list has a search (`list.search`), so one setting serves both (decision 0029).
 */
export function isSearchable(resource: Resource): boolean {
    return isSearchableResource(resource);
}

/** The resources of the global search that the user can list. */
export function getSearchableResources(definition: Definition): Resource[] {
    return definition.resources.filter(
        (resource) => isSearchable(resource) && can(resource.abilities, 'viewAny'),
    );
}
