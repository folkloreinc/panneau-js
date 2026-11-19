import { z } from 'zod';

import { Action } from './action';
import { Abilities } from './common';
import { Field } from './field';
import { LayoutNode } from './layout';
import { ListDefinition } from './list';
import { OverviewPeriod, Widget } from './widget';

export const ResourceFeatures = z.looseObject({
    drafts: z.boolean().optional(),
    revisions: z.boolean().optional(),
    preview: z
        .union([
            z.null(),
            z.looseObject({
                mode: z.enum(['component', 'iframe']),
                component: z
                    .string()
                    .optional()
                    .meta({ description: '`component`: the plugin preview.' }),
            }),
        ])
        .optional(),
    search: z.boolean().optional().meta({
        description:
            'Whether the resource is in the global search. Defaults to whether its list has a search (`list.search`).',
    }),
});

export const ResourceType = z
    .looseObject({
        id: z.string().min(1).meta({
            description: 'The `type` of the items of this type, which the client sends on create.',
        }),
        label: z.string().meta({
            description:
                'The name of the type: the title of its create form and of its choice when creating.',
        }),
        description: z
            .string()
            .optional()
            .meta({ description: 'A line under the label, in the choice of a type.' }),
        icon: z.string().optional(),
        // The return type is written out so that declaration files name `Field`.
        get fields(): z.ZodArray<typeof Field> {
            return z.array(Field).meta({
                description:
                    "The type's own fields, after those of the resource. The resource's `form.layout` can name them: forms of the other types leave them out.",
            });
        },
        abilities: Abilities.optional().meta({
            description:
                '`create: false`: the type is not offered when creating, and the backend refuses to create one (a singleton such as the home page). Its items can still be edited.',
        }),
    })
    .meta({
        description:
            'A type of the items of a resource (decision 0077): the items of a type have the fields of the resource and its own.',
    });

export const SummaryPeriod = OverviewPeriod.extend({
    filter: z.string().min(1).optional().meta({
        description:
            "The id of the list's `date-range` filter that the period sets. Defaults to the first `date-range` filter of the list.",
    }),
}).meta({
    description:
        "The period of a summary (decision 0084): the list's own `date-range` filter, so choosing it filters the rows too.",
});

export const ResourceSummary = z
    .looseObject({
        widgets: z.array(Widget).meta({
            description:
                "The widgets of the summary for the user, in order, drawn above the list in the grid of a dashboard. Widgets on this resource get the list's current filters and search, unless `settings.followsList` is `false`. Widgets with data of their own are fed by `GET /dashboard/widgets/{widget}?resource={resource}`, with the filters and the search of the list.",
        }),
        list: z.enum(['collapsed']).optional().meta({
            description:
                '`collapsed`: the resource opens on its summary, with its list folded under it behind "Show the N items". Without it, the list is shown under the summary.',
        }),
        period: SummaryPeriod.optional(),
    })
    .meta({
        description:
            'Widgets above the list of a resource, which follow its filters and its search (decision 0084).',
    });

export const Resource = z
    .looseObject({
        id: z.string().min(1),
        kind: z.string().min(1).optional().meta({
            description:
                "What the resource is. `media`: a library of media (decision 0026), with a `file` field and a `media` on each item. Without it, an ordinary resource. Clients treat a kind they don't know as an ordinary resource.",
        }),
        label: z.looseObject({ singular: z.string(), plural: z.string() }),
        description: z.string().optional(),
        icon: z.string().optional(),
        parent: z.string().min(1).optional().meta({
            description:
                'The page of `pages` that the list of the resource belongs to (decision 0093), such as the dashboard page that a log is reached from: the app shows it above the title of the list and of its items, and keeps it current in the menus when the resource is not in them. Not `home`, nor a page with `params`.',
        }),
        itemTitle: z
            .string()
            .optional()
            .meta({ description: 'The field used as the title of an item, in lists and pickers.' }),
        itemSubtitle: z.string().optional().meta({
            description:
                'The field shown under the title of an item, in search results, cards and pickers.',
        }),
        itemImage: z.string().optional().meta({
            description:
                "The field that holds the image of an item (a media, a file or a URL), in search results, pickers, the gallery and the thumbnails of the table. Defaults to the item's `media` in a resource of kind `media` (decision 0061).",
        }),
        open: z
            .union([z.enum(['panel', 'edit']), z.string().min(1)])
            .optional()
            .meta({
                description:
                    "Where an item's title goes, in its list and wherever the app links to the item (decision 0082). `edit`, the default: its edit form, and the show route redirects there. An item the user can't update still opens in the panel. `panel`: the show route, with the item's details in a panel next to the list, for items read more than edited, or shown with their preview. Clients treat a value they don't know as `edit`.",
            }),
        itemActions: z.array(z.string().min(1)).optional().meta({
            description:
                "The built-in item actions the resource shows, in their order (decision 0040): some of `show`, `edit`, `duplicate` and `delete`. Defaults to all four. Each one is shown on the items whose abilities allow it (`view`, `update`, `duplicate`, `delete`). `[]` shows none. Clients ignore ids they don't know.",
        }),
        fields: z.array(Field),
        form: z.looseObject({ layout: z.array(LayoutNode).optional() }).optional(),
        list: ListDefinition.optional(),
        actions: z.array(Action).optional(),
        abilities: Abilities.optional(),
        features: ResourceFeatures.optional(),
        types: z.array(ResourceType).optional().meta({
            description:
                "The types of the resource's items, each with fields of its own (decision 0077). Each item has a `type`, set when it is created, among their ids.",
        }),
        summary: ResourceSummary.optional().meta({
            description:
                'Widgets above the list, which follow its filters and its search (decision 0084).',
        }),
        settings: z.record(z.string(), z.unknown()).optional(),
    })
    .meta({ description: 'A set of items managed in the admin.' });

export type ResourceFeatures = z.infer<typeof ResourceFeatures>;
export type ResourceType = z.infer<typeof ResourceType>;
export type SummaryPeriod = z.infer<typeof SummaryPeriod>;
export type ResourceSummary = z.infer<typeof ResourceSummary>;
export type Resource = z.infer<typeof Resource>;
/** A resource as a backend writes it, before defaults are applied. */
export type ResourceInput = z.input<typeof Resource>;
