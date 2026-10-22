import { z } from 'zod';

import { PORTABLE_RULES } from '../constants';
import { Condition, Option } from './common';

const message = z
    .string()
    .optional()
    .meta({ description: 'Message shown when the rule fails, instead of the default one.' });

const DateBound = z.union([
    z.string().meta({ description: 'An ISO 8601 date or date-time.' }),
    z.looseObject({ field: z.string().min(1) }).meta({ description: 'Another field of the form.' }),
]);

export const Rule = z
    .union([
        z.looseObject({ rule: z.literal('required'), message }),
        z.looseObject({ rule: z.enum(['min', 'max']), value: z.number(), message }),
        z.looseObject({
            rule: z.literal('pattern'),
            value: z.string(),
            flags: z.string().optional(),
            message,
        }),
        z.looseObject({ rule: z.enum(['email', 'url']), message }),
        z.looseObject({
            rule: z.literal('in'),
            value: z.array(z.union([z.string(), z.number(), z.boolean()])),
            message,
        }),
        z.looseObject({ rule: z.literal('accept'), value: z.array(z.string().min(1)), message }),
        z.looseObject({ rule: z.literal('maxSize'), value: z.number().int().positive(), message }),
        z.looseObject({ rule: z.enum(['before', 'after']), value: DateBound, message }),
        z
            .looseObject({
                rule: z
                    .string()
                    .refine((rule) => !(PORTABLE_RULES as readonly string[]).includes(rule)),
                message,
            })
            .meta({
                description:
                    "A rule added in a later version of the protocol. Clients that don't know it ignore it; the server still enforces it.",
            }),
    ])
    .meta({
        description:
            'A portable validation rule. `min` and `max` apply to numbers, and to the length of text and arrays. `accept` lists MIME types (`image/*`). `maxSize` is in bytes.',
    });

export const BlockType = z.looseObject({
    id: z.string().min(1),
    label: z.string(),
    icon: z.string().optional(),
    // Return types are written out so that declaration files keep the recursion.
    get fields(): z.ZodArray<typeof Field> {
        return z.array(Field);
    },
});

export const Field = z
    .looseObject({
        name: z.string().min(1),
        type: z
            .string()
            .min(1)
            .meta({ description: 'A built-in field type, or a type provided by a plugin.' }),
        label: z.string().optional(),
        help: z.string().optional(),
        placeholder: z.string().optional(),
        default: z.unknown().optional(),
        localized: z
            .boolean()
            .optional()
            .meta({ description: 'The value is an object keyed by locale.' }),
        readOnly: z.boolean().optional(),
        createOnly: z.boolean().optional(),
        updateOnly: z.boolean().optional(),
        rules: z.array(Rule).optional(),
        visibleWhen: Condition.optional(),
        options: z.array(Option).optional().meta({ description: '`select`: the choices.' }),
        multiple: z
            .boolean()
            .optional()
            .meta({ description: '`select`, `relation`, `media`, `file`: the value is an array.' }),
        resource: z
            .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
            .optional()
            .meta({
                description:
                    '`relation`: id of the related resource. `media`: id of a resource of kind `media`, or a list of them; without it, every library of the definition (decision 0027).',
            }),
        accept: z
            .array(z.string())
            .optional()
            .meta({ description: '`media`, `file`: accepted MIME types.' }),
        from: z
            .string()
            .optional()
            .meta({ description: '`slug`: the field the slug is generated from.' }),
        display: z.string().optional().meta({
            description: 'Display used in lists, when it differs from the default one of the type.',
        }),
        get fields(): z.ZodOptional<z.ZodArray<typeof Field>> {
            return z
                .array(Field)
                .optional()
                .meta({ description: '`group` and `repeater`: the nested fields.' });
        },
        get types(): z.ZodOptional<z.ZodArray<typeof BlockType>> {
            return z
                .array(BlockType)
                .optional()
                .meta({ description: '`repeater`: typed blocks, each with its own fields.' });
        },
        settings: z.record(z.string(), z.unknown()).optional(),
    })
    .meta({ description: 'A field of a form.' });

export type Rule = z.infer<typeof Rule>;
export type BlockType = z.infer<typeof BlockType>;
export type Field = z.infer<typeof Field>;
