import { z } from 'zod';

import { DATE_RANGE_OPEN_BOUNDS, PORTABLE_RULES, RICH_TEXT_STYLE_ELEMENTS } from '../constants';
import { Abilities, Condition, Option } from './common';

const message = z
    .string()
    .optional()
    .meta({ description: 'Message shown when the rule fails, instead of the default one.' });

const mode = z.enum(['create', 'update']).optional().meta({
    description:
        'The rule only applies when the item is created (`create`) or updated (`update`): a password required to create a user, optional to edit one. Without it, the rule applies in both modes.',
});

const Ratio = z
    .string()
    .regex(/^[1-9][0-9]*:[1-9][0-9]*$/)
    .meta({ description: 'An aspect ratio, as `width:height`: `16:9`.' });

const CurrencyCode = z
    .string()
    .regex(/^[A-Z]{3}$/)
    .meta({ description: 'An ISO 4217 currency code, in capitals: `CAD`.' });

const DateRangeOpen = z.enum(DATE_RANGE_OPEN_BOUNDS).meta({
    description: 'Which bounds of the range can be `null`: `start`, `end` or `both`.',
});

const DateBound = z.union([
    z.string().meta({ description: 'An ISO 8601 date or date-time.' }),
    z.looseObject({ field: z.string().min(1) }).meta({ description: 'Another field of the form.' }),
]);

export const Rule = z
    .union([
        z.looseObject({ rule: z.literal('required'), message, mode }),
        z.looseObject({ rule: z.enum(['min', 'max']), value: z.number(), message, mode }),
        z.looseObject({
            rule: z.literal('pattern'),
            value: z.string(),
            flags: z.string().optional(),
            message,
            mode,
        }),
        z.looseObject({ rule: z.enum(['email', 'url', 'json', 'tel']), message, mode }),
        z.looseObject({
            rule: z.literal('daterange'),
            open: DateRangeOpen.optional(),
            message,
            mode,
        }),
        z.looseObject({
            rule: z.literal('money'),
            currencies: z.array(CurrencyCode).optional().meta({
                description: 'The currencies allowed. Without them, any ISO 4217 currency.',
            }),
            message,
            mode,
        }),
        z.looseObject({
            rule: z.literal('in'),
            value: z.array(z.union([z.string(), z.number(), z.boolean()])),
            message,
            mode,
        }),
        z.looseObject({
            rule: z.literal('accept'),
            value: z.array(z.string().min(1)),
            message,
            mode,
        }),
        z.looseObject({
            rule: z.literal('maxSize'),
            value: z.number().int().positive(),
            message,
            mode,
        }),
        z.looseObject({ rule: z.enum(['before', 'after']), value: DateBound, message, mode }),
        z.looseObject({
            rule: z.literal('crop'),
            value: z.looseObject({
                ratios: z.array(Ratio).optional().meta({
                    description:
                        'A crop must have one of them: its height is within one pixel of its width divided by the ratio, after its rotation.',
                }),
                required: z
                    .boolean()
                    .optional()
                    .meta({ description: 'Each image needs a crop for this use.' }),
            }),
            message,
            mode,
        }),
        z
            .looseObject({
                rule: z
                    .string()
                    .refine((rule) => !(PORTABLE_RULES as readonly string[]).includes(rule)),
                message,
                mode,
            })
            .meta({
                description:
                    "A rule added in a later version of the protocol. Clients that don't know it ignore it; the server still enforces it.",
            }),
    ])
    .meta({
        description:
            'A portable validation rule. `min` and `max` apply to numbers, to the amount of `money` values (in minor units), and to the length of text and arrays. `daterange` and `money` are implied by their types, with the `open` bounds and the `currencies` of the field (decision 0053). `accept` lists MIME types (`image/*`). `maxSize` is in bytes. `crop` checks the transform of each image of an `image` or `media` value (decision 0031).',
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
        readOnly: z.boolean().optional().meta({
            description:
                "Nobody edits the field (a computed value). For a field the current user can't edit, use `abilities.update: false`.",
        }),
        abilities: Abilities.optional().meta({
            description:
                "What the current user can do with the field (decision 0046). Only `false` restricts: `view: false` leaves the field out of forms, details and lists, and items don't carry its value; `update: false` makes it read-only, and the backend ignores its value. For the fields at the top of a resource and of its types.",
        }),
        createOnly: z.boolean().optional(),
        updateOnly: z.boolean().optional(),
        rules: z.array(Rule).optional(),
        visibleWhen: Condition.optional(),
        options: z.array(Option).optional().meta({ description: '`select`: the choices.' }),
        multiple: z.boolean().optional().meta({
            description: '`select`, `relation`, `media`, `image`, `file`: the value is an array.',
        }),
        resource: z
            .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
            .optional()
            .meta({
                description:
                    '`relation`: id of the related resource. `media`, `image`: id of a resource of kind `media`, or a list of them; without it, every library of the definition (decision 0027).',
            }),
        accept: z.array(z.string()).optional().meta({
            description:
                '`media`, `image`, `file`: accepted MIME types. `image` defaults to `image/*`.',
        }),
        ratios: z.array(Ratio).optional().meta({
            description:
                '`image`: ratios the editor suggests. The `crop` rule enforces ratios (decision 0031).',
        }),
        rotate: z.boolean().optional().meta({
            description: '`image`: whether the editor offers rotation and flips. Defaults to true.',
        }),
        focalPoint: z.boolean().optional().meta({
            description: '`image`: whether the editor offers the focal point. Defaults to true.',
        }),
        transformBase: z.enum(['media', 'original', 'choose']).optional().meta({
            description:
                "`image`: what a transform for one use starts from: the media's own transform (`media`, the default), the original file, or the user's choice in the editor (decision 0031).",
        }),
        from: z.string().optional().meta({
            description:
                '`slug`: the field the slug is generated from. `region`: the field of the same object that holds its country.',
        }),
        check: z.boolean().optional().meta({
            description:
                'The client checks the value with the backend as it is typed, with `POST /resources/{resource}/fields/{field}/check`: whether a `slug` is available, and its URL. A field at the top of the resource only.',
        }),
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

/** A block style of a `richtext` field: a named class on an element (`<p class="big">`). */
export const RichTextStyle = z
    .looseObject({
        label: z.string().meta({ description: 'The name of the style in the toolbar.' }),
        class: z.string().min(1).meta({
            description:
                'The class the style puts on the element: `big`. Several classes are separated by spaces.',
        }),
        element: z.enum(RICH_TEXT_STYLE_ELEMENTS).optional().meta({
            description:
                'The element the style applies to: `p` (the default), `h1` to `h6`, `blockquote`, `ul`, `ol` or `li`.',
        }),
    })
    .meta({
        description:
            'A block style of a `richtext` field: a named class on a paragraph, a heading, a quote or a list (`<p class="big">`).',
    });

/**
 * The `settings` of a `richtext` field: its toolbar, heading levels, block styles and which links
 * open in a new tab. `validateDefinition()` checks them.
 */
export const RichTextSettings = z
    .looseObject({
        toolbar: z.array(z.string().min(1)).optional().meta({
            description:
                "The toolbar, in order: `heading`, `style`, `bold`, `italic`, `underline`, `strike`, `superscript`, `subscript`, `code`, `link`, `bulletList`, `orderedList`, `blockquote`, `horizontalRule`, `clear`, `undo`, `redo`, `|` between groups, and the buttons of plugins. Clients skip the names they don't know.",
        }),
        headings: z.array(z.number().int().min(1).max(6)).optional().meta({
            description: 'The heading levels the toolbar offers. Defaults to 2, 3 and 4.',
        }),
        styles: z.array(RichTextStyle).optional().meta({ description: 'The block styles.' }),
        links: z
            .looseObject({
                newTab: z.enum(['choose', 'external', 'never']).optional().meta({
                    description:
                        'Which links open in a new tab (`target="_blank" rel="noopener noreferrer"`): as the user chooses (the default), every link to another site, or none.',
                }),
            })
            .optional(),
    })
    .meta({
        description:
            'The `settings` of a `richtext` field. Its value is HTML. The toolbar only limits what users add: content that the field stores keeps its elements and attributes.',
    });

/** The `settings` of a `daterange` field (decision 0053). `validateDefinition()` checks them. */
export const DateRangeSettings = z
    .looseObject({
        time: z.boolean().optional().meta({
            description:
                'The bounds are date-times, with an offset (`2026-11-04T23:30:00Z`). Without it, they are days (`2026-11-04`), both inclusive.',
        }),
        allDay: z.boolean().optional().meta({
            description:
                'With `time`: an "All day" switch. An all-day value has days as bounds, and `"allDay": true`.',
        }),
        open: DateRangeOpen.optional(),
        timeZone: z.string().min(1).optional().meta({
            description:
                "The IANA time zone the date-times are shown and typed in (`America/Toronto`), when the value has none. Without it, the browser's.",
        }),
        chooseTimeZone: z.boolean().optional().meta({
            description:
                'With `time`: the field has a menu of time zones, and keeps the choice in the value (`timeZone`).',
        }),
    })
    .meta({
        description:
            'The `settings` of a `daterange` field: days or date-times, an "All day" switch, open bounds and the time zone of its date-times.',
    });

/** The `settings` of a `money` field (decision 0053). `validateDefinition()` checks them. */
export const MoneySettings = z
    .looseObject({
        currency: CurrencyCode.optional().meta({
            description: 'The currency of every amount: the field shows it and cannot change it.',
        }),
        currencies: z.array(CurrencyCode).min(1).optional().meta({
            description:
                'The currencies the user picks from, the first one for a new amount. Without `currency` or `currencies`, every currency.',
        }),
    })
    .meta({
        description:
            'The `settings` of a `money` field: its currency, or the currencies to pick from. `min` and `max` rules apply to the amount, in minor units.',
    });

export type Rule = z.infer<typeof Rule>;
export type BlockType = z.infer<typeof BlockType>;
export type Field = z.infer<typeof Field>;
/** A block style of a `richtext` field. */
export type RichTextStyle = z.infer<typeof RichTextStyle>;
/** The `settings` of a `richtext` field. */
export type RichTextSettings = z.infer<typeof RichTextSettings>;
/** The `settings` of a `daterange` field. */
export type DateRangeSettings = z.infer<typeof DateRangeSettings>;
/** The `settings` of a `money` field. */
export type MoneySettings = z.infer<typeof MoneySettings>;
