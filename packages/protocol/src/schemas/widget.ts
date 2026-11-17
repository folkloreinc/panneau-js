import { z } from 'zod';

import {
    WIDGET_BREAKDOWN_MAX_ITEMS,
    WIDGET_LIST_MAX_ITEMS,
    WIDGET_SERIES_PERIODS,
} from '../widgets';

const ToneName = z.string().regex(/^[a-z0-9-]+$/);

const QueryValue = z.union([z.string(), z.number(), z.boolean()]);

export const WidgetSettings = z
    .looseObject({
        resource: z.string().min(1).optional().meta({
            description:
                'Built-in types: the resource that feeds the widget. A `stat` counts the items of its list (`meta.total`), a `list` shows its first items, and a `series`, a `breakdown` and a `stat` with a `sum:` measure read `GET /resources/{resource}/aggregate` (decision 0084). Such a widget has no data at `GET /dashboard/widgets/{widget}`.',
        }),
        query: z
            .record(z.string(), z.union([QueryValue, z.array(QueryValue)]))
            .optional()
            .meta({
                description:
                    'With `resource`: the query of the list, as its query parameters (`{ "filter[status]": "to-judge", "sort": "-created_at" }`), and of the link to the list. The client sets `page`, `perPage` and `cursor`.',
            }),
        measure: z.string().min(1).optional().meta({
            description:
                'With `resource`, for a `stat`, a `series` and a `breakdown`: `count` (the default), or `sum:{field}` of a field of the `sum` of the aggregates of the list.',
        }),
        group: z.string().min(1).optional().meta({
            description:
                'With `resource`: for a `series`, `{period}:{date field}` (`day`, `week` or `month`, and a field of `dates` of the aggregates of the list); for a `breakdown`, a field of their `groupBy`.',
        }),
        target: z.number().positive().optional().meta({
            description:
                'With `resource`, for a `stat`: its `target` (a budget, a quota), in the unit of the value: minor units for a sum of `money`.',
        }),
    })
    .meta({
        description:
            'The settings of a widget: `resource`, `query`, `measure`, `group` and `target` for the built-in types on a resource, anything else for widgets of plugins.',
    });

export const Widget = z.looseObject({
    id: z
        .string()
        .min(1)
        .meta({ description: 'Unique in its dashboard: the `{widget}` of its route.' }),
    type: z.string().min(1).meta({
        description:
            'Built-in: `stat` (a number), `series` (a line over days, weeks or months), `list` (a few items) and `breakdown` (the parts of a total). Other types are widgets of plugins.',
    }),
    label: z.string().optional(),
    width: z.number().int().min(1).max(12).optional().meta({
        description:
            'Columns of a grid of 12. Defaults to 3 for a `stat`, 6 for others. One column on a phone.',
    }),
    settings: WidgetSettings.optional(),
});

export const WidgetBadge = z
    .looseObject({ label: z.string(), tone: ToneName.optional() })
    .meta({ description: 'A badge: a word, in a tone of the theme.' });

export const StatWidgetData = z
    .looseObject({
        value: z.number().meta({ description: 'The number, in large type.' }),
        help: z.string().nullable().optional().meta({
            description: 'A line under the number, translated: `3 more than last week`.',
        }),
        tone: ToneName.nullable().optional().meta({
            description:
                'A tone of the theme, only when the number calls for attention (`warning`, `danger`): neutral otherwise, and at 0.',
        }),
        url: z
            .string()
            .nullable()
            .optional()
            .meta({ description: 'Where the widget links: the list of what it counts.' }),
        target: z.number().positive().nullable().optional().meta({
            description:
                'A target for the number (a budget, a quota), drawn as a meter under it. Past it, the meter takes `tone`, or `danger` without one (decision 0084).',
        }),
    })
    .meta({ description: 'The data of a `stat` widget: a number (decision 0064).' });

export const SeriesPoint = z.looseObject({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .meta({ description: 'The first day of the period: `2026-10-05`.' }),
    value: z.number(),
});

export const SeriesWidgetData = z
    .looseObject({
        period: z.enum(WIDGET_SERIES_PERIODS).meta({ description: 'The period of each point.' }),
        points: z.array(SeriesPoint).meta({
            description:
                'One point per period, the dates going up. Periods without a value are points at 0.',
        }),
        total: z.number().nullable().optional().meta({
            description: 'The total over the points, shown with the line.',
        }),
    })
    .superRefine((data, context) => {
        data.points.forEach((point, index) => {
            const previous = data.points[index - 1];
            if (previous !== undefined && point.date <= previous.date) {
                context.addIssue({
                    code: 'custom',
                    message: 'The dates of the points must go up.',
                    path: ['points', index, 'date'],
                });
            }
        });
    })
    .meta({
        description: 'The data of a `series` widget: a line of values per period (decision 0064).',
    });

export const ListWidgetItem = z.looseObject({
    title: z.string(),
    description: z.string().nullable().optional(),
    meta: z
        .string()
        .nullable()
        .optional()
        .meta({ description: 'A short fact at the end of the item: `12 answers`.' }),
    url: z.string().nullable().optional(),
    badge: WidgetBadge.nullable().optional(),
});

export const ListWidgetData = z
    .looseObject({
        items: z
            .array(ListWidgetItem)
            .max(WIDGET_LIST_MAX_ITEMS)
            .meta({
                description: `At most ${WIDGET_LIST_MAX_ITEMS} items, the most useful first.`,
            }),
        empty: z.string().nullable().optional().meta({
            description: 'The message without items, translated: `No open contests.`',
        }),
        url: z
            .string()
            .nullable()
            .optional()
            .meta({ description: 'Where "See all" links, under the items.' }),
    })
    .meta({ description: 'The data of a `list` widget: a few items (decision 0064).' });

export const BreakdownWidgetItem = z.looseObject({
    label: z.string().meta({ description: 'What the part is, translated: `Failed`.' }),
    value: z.number().meta({ description: 'The count or the sum of the part.' }),
    tone: ToneName.nullable().optional().meta({
        description: 'A tone of the theme for its bar: the tone of an option of a `select`.',
    }),
    url: z
        .string()
        .nullable()
        .optional()
        .meta({ description: 'Where the bar links: the list of what it counts.' }),
    key: z.union([z.string(), z.number(), z.boolean()]).nullable().optional().meta({
        description:
            'From `GET /resources/{resource}/aggregate`: the value of the field it groups, `null` for the items without one. The client links the bar to the list filtered by it.',
    }),
});

export const BreakdownWidgetData = z
    .looseObject({
        items: z
            .array(BreakdownWidgetItem)
            .max(WIDGET_BREAKDOWN_MAX_ITEMS)
            .meta({
                description: `The parts, at most ${WIDGET_BREAKDOWN_MAX_ITEMS}: clients draw the largest first.`,
            }),
        total: z.number().nullable().optional().meta({
            description:
                'The total the parts are of. Items with several values count in each of their parts, and once in the total.',
        }),
        other: z.number().nullable().optional().meta({
            description: 'The rest of the total, past the items: drawn last, as "Other".',
        }),
    })
    .meta({
        description:
            'The data of a `breakdown` widget: the parts of a total, as horizontal bars (decision 0084).',
    });

/** The schema of the data of each built-in widget type. */
export const widgetDataSchemas = {
    stat: StatWidgetData,
    series: SeriesWidgetData,
    list: ListWidgetData,
    breakdown: BreakdownWidgetData,
} as const;

export type WidgetSettings = z.infer<typeof WidgetSettings>;
export type Widget = z.infer<typeof Widget>;
export type WidgetBadge = z.infer<typeof WidgetBadge>;
export type StatWidgetData = z.infer<typeof StatWidgetData>;
export type SeriesPoint = z.infer<typeof SeriesPoint>;
export type SeriesWidgetData = z.infer<typeof SeriesWidgetData>;
export type ListWidgetItem = z.infer<typeof ListWidgetItem>;
export type ListWidgetData = z.infer<typeof ListWidgetData>;
export type BreakdownWidgetItem = z.infer<typeof BreakdownWidgetItem>;
export type BreakdownWidgetData = z.infer<typeof BreakdownWidgetData>;
