import { z } from 'zod';

import { Action } from './action';
import { Abilities } from './common';
import { BlockType, Field } from './field';
import { LayoutNode } from './layout';
import { ListDefinition } from './list';

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
                'The field that holds the image of an item (a media or a URL), in search results, cards and pickers.',
        }),
        fields: z.array(Field),
        form: z.looseObject({ layout: z.array(LayoutNode).optional() }).optional(),
        list: ListDefinition.optional(),
        actions: z.array(Action).optional(),
        abilities: Abilities.optional(),
        features: ResourceFeatures.optional(),
        types: z
            .array(BlockType)
            .optional()
            .meta({ description: 'Variants of the resource, each with its own extra fields.' }),
        settings: z.record(z.string(), z.unknown()).optional(),
    })
    .meta({ description: 'A set of items managed in the admin.' });

export type ResourceFeatures = z.infer<typeof ResourceFeatures>;
export type Resource = z.infer<typeof Resource>;
/** A resource as a backend writes it, before defaults are applied. */
export type ResourceInput = z.input<typeof Resource>;
