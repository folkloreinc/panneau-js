import { z } from 'zod';

import { Condition } from './common';

/** Layout node types every Panneau frontend renders. */
export const BUILT_IN_LAYOUT_NODE_TYPES = [
    'row',
    'column',
    'section',
    'tabs',
    'tab',
    'sidebar',
    'field',
    'text',
    'component',
] as const;

export const LayoutNode = z
    .looseObject({
        type: z
            .string()
            .min(1)
            .meta({ description: 'A built-in node type, or a type provided by a plugin.' }),
        name: z.string().min(1).optional().meta({ description: '`field`: the name of the field.' }),
        label: z.string().optional().meta({ description: '`section`, `tab`: the title.' }),
        description: z.string().optional(),
        text: z.string().optional().meta({ description: '`text`: a static paragraph.' }),
        component: z
            .string()
            .optional()
            .meta({ description: '`component`: a component provided by a plugin.' }),
        props: z.record(z.string(), z.unknown()).optional(),
        width: z
            .number()
            .int()
            .min(1)
            .max(12)
            .optional()
            .meta({ description: 'Width on a 12-column grid, inside a `row`.' }),
        collapsible: z.boolean().optional(),
        collapsed: z.boolean().optional(),
        visibleWhen: Condition.optional(),
        get children() {
            return z.array(LayoutNode).optional();
        },
    })
    .meta({
        description:
            'A node of a form layout. Containers (`row`, `column`, `section`, `tabs`, `tab`, `sidebar`) have `children`. Fields that no node references are appended at the end of the form.',
    });

export type BuiltInLayoutNodeType = (typeof BUILT_IN_LAYOUT_NODE_TYPES)[number];
export type LayoutNode = z.infer<typeof LayoutNode>;
