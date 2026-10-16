import { z } from 'zod';

import { Option } from './common';

export const Column = z
    .looseObject({
        field: z.string().min(1).optional().meta({ description: 'The field shown in the column.' }),
        id: z
            .string()
            .min(1)
            .optional()
            .meta({ description: 'Id of a column that is not a field.' }),
        label: z.string().optional(),
        display: z.string().optional().meta({ description: 'How the value is displayed.' }),
        sortable: z.boolean().optional(),
        width: z.union([z.number(), z.string()]).optional(),
        align: z.enum(['start', 'center', 'end']).optional(),
    })
    .refine((column) => column.field !== undefined || column.id !== undefined, {
        message: 'A column needs a `field` or an `id`.',
    });

export const Filter = z.looseObject({
    id: z.string().min(1).meta({ description: 'Sent as `filter[id]`.' }),
    type: z.string().min(1).meta({
        description: 'Built-in: `text`, `select`, `toggle`, `date`, `date-range`, `relation`.',
    }),
    label: z.string().optional(),
    options: z.array(Option).optional(),
    resource: z.string().optional(),
    multiple: z.boolean().optional(),
    default: z.unknown().optional(),
});

export const ListDefinition = z.looseObject({
    columns: z.array(Column).optional(),
    filters: z.array(Filter).optional(),
    sorts: z
        .array(z.string().min(1))
        .optional()
        .meta({ description: 'Fields the list can be sorted by.' }),
    defaultSort: z
        .string()
        .optional()
        .meta({ description: 'Same format as the `sort` query parameter: `-published_at,title`.' }),
    search: z.boolean().optional().meta({ description: 'Whether the `q` parameter is supported.' }),
    layouts: z.array(z.string().min(1)).optional(),
    perPage: z.number().int().positive().optional(),
    perPageOptions: z.array(z.number().int().positive()).optional(),
    inlineEdit: z
        .array(z.string().min(1))
        .optional()
        .meta({ description: 'Fields editable in the list.' }),
    selectable: z.boolean().optional(),
});

export type Column = z.infer<typeof Column>;
export type Filter = z.infer<typeof Filter>;
export type ListDefinition = z.infer<typeof ListDefinition>;
