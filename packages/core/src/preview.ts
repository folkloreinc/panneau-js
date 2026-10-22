import type { Item, Resource } from '@panneau/protocol';

/**
 * Props of a preview component (the `previews` of a plugin), for a resource whose
 * `features.preview` is `{ "mode": "component", "component": "<name>" }`. It renders the item as
 * the site would, or anything richer than its values: blocks, partials, charts.
 */
export interface PreviewProps {
    /** The item: as saved, or with the unsaved values of a form. */
    item: Item;
    resource: Resource;
    /** The locale of the content to show, for localized values. */
    locale: string;
}
