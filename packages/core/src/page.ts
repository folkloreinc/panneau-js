import type { Definition } from '@panneau/protocol';

/**
 * Props of a page (the `pages` of a plugin), for a page of the definition's `pages` whose
 * `component` it provides, and of the built-in `dashboard`. It also gets the page's `props`, as
 * declared in the definition.
 */
export interface PageProps {
    /** The id of the page in `pages`. */
    id: string;
    definition: Definition;
    /** The values of the page's `params`, from its path. */
    params: Readonly<Record<string, string>>;
    /** The base path of the app, for its links. */
    basePath: string;
}
