import { z } from 'zod';

import { Abilities } from './common';
import { Field } from './field';
import { LayoutNode } from './layout';

/** Built-in action ids. */
export const BUILT_IN_ACTIONS = [
    'show',
    'edit',
    'duplicate',
    'delete',
    'restore',
    'export',
    'import',
] as const;

export const ActionScope = z.enum(['item', 'selection', 'resource']);

export const ActionPlacement = z.enum(['row', 'toolbar', 'form', 'menu']);

export const ActionConfirm = z.union([
    z.boolean(),
    z.looseObject({
        title: z.string().optional(),
        message: z
            .string()
            .optional()
            .meta({ description: 'ICU message. `{count}` is the number of items.' }),
        confirmLabel: z.string().optional(),
        cancelLabel: z.string().optional(),
    }),
]);

export const Action = z
    .looseObject({
        id: z.string().min(1),
        label: z.string(),
        icon: z.string().optional(),
        kind: z.enum(['server', 'link', 'client']).default('server').meta({
            description:
                '`server` calls the action endpoint; `link` navigates; `client` runs a plugin handler.',
        }),
        scope: z.array(ActionScope).min(1),
        placement: z.array(ActionPlacement).optional(),
        destructive: z.boolean().optional(),
        confirm: ActionConfirm.optional(),
        fields: z.array(Field).optional().meta({ description: 'Parameters, shown in a modal.' }),
        layout: z.array(LayoutNode).optional(),
        queued: z
            .boolean()
            .optional()
            .meta({ description: 'The action always answers `202` with a run.' }),
        url: z
            .string()
            .optional()
            .meta({ description: '`link`: URL template, with `{id}` for the item.' }),
        route: z
            .string()
            .optional()
            .meta({ description: '`link`: name of a route in the definition.' }),
        component: z.string().optional().meta({ description: '`client`: the plugin handler.' }),
        abilities: Abilities.optional().meta({
            description: '`run`: whether the current user can run the action on the resource.',
        }),
    })
    .superRefine((action, context) => {
        if (action.kind === 'link' && action.url === undefined && action.route === undefined) {
            context.addIssue({
                code: 'custom',
                message: 'A `link` action needs a `url` or a `route`.',
            });
        }
        if (action.kind === 'client' && action.component === undefined) {
            context.addIssue({ code: 'custom', message: 'A `client` action needs a `component`.' });
        }
    })
    .meta({ description: 'An operation on one item, a selection, or the whole resource.' });

export type BuiltInAction = (typeof BUILT_IN_ACTIONS)[number];
export type ActionScope = z.infer<typeof ActionScope>;
export type ActionPlacement = z.infer<typeof ActionPlacement>;
export type ActionConfirm = z.infer<typeof ActionConfirm>;
export type Action = z.infer<typeof Action>;
/** An action as a backend writes it: `kind` defaults to `server`. */
export type ActionInput = z.input<typeof Action>;
