import { z } from 'zod';

export const Id = z
    .string()
    .min(1)
    .meta({ description: 'Opaque identifier. Clients never parse or generate ids.' });

export const Abilities = z.record(z.string(), z.boolean()).meta({
    description:
        'What the current user can do, keyed by ability (`viewAny`, `create`, `update`, `delete`, or an action id).',
});

export const RouteReference = z.looseObject({
    route: z.string().min(1).meta({ description: 'Name of a route in the definition.' }),
    params: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export const Condition = z
    .looseObject({
        field: z.string().min(1).optional().meta({ description: 'Field name, or a dot path.' }),
        equals: z.unknown().optional(),
        in: z.array(z.unknown()).optional(),
        notIn: z.array(z.unknown()).optional(),
        filled: z.boolean().optional(),
        // Return types are written out so that declaration files keep the recursion.
        get all(): z.ZodOptional<z.ZodArray<typeof Condition>> {
            return z.array(Condition).optional();
        },
        get any(): z.ZodOptional<z.ZodArray<typeof Condition>> {
            return z.array(Condition).optional();
        },
    })
    .meta({
        description:
            'A condition on form values: compare one field (`equals`, `in`, `notIn`, `filled`), or combine conditions with `all` or `any`.',
    });

export const Option = z.looseObject({
    value: z.union([z.string(), z.number(), z.boolean()]),
    label: z.string(),
    description: z.string().optional(),
    disabled: z.boolean().optional(),
    tone: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .optional()
        .meta({
            description:
                'The tone of the option where it shows as a badge, in lists and details: `neutral` (the default), `accent`, `success`, `warning`, `danger`, `info`, or a tone of the theme.',
        }),
});

export type Id = z.infer<typeof Id>;
export type Abilities = z.infer<typeof Abilities>;
export type RouteReference = z.infer<typeof RouteReference>;
export type Condition = z.infer<typeof Condition>;
export type Option = z.infer<typeof Option>;
