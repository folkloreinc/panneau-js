import { z } from 'zod';

import { CURRENCY_CODES } from '../currencies';
import { OVERVIEW_PERIODS } from '../periods';
import {
    WIDGET_BREAKDOWN_MAX_ITEMS,
    WIDGET_FORMAT_CURRENCY_DISPLAYS,
    WIDGET_FORMAT_NOTATIONS,
    WIDGET_FORMAT_SIGN_DISPLAYS,
    WIDGET_FORMAT_STYLES,
    WIDGET_FORMAT_UNIT_DISPLAYS,
    WIDGET_GOOD_WHEN,
    WIDGET_LIST_MAX_ITEMS,
    WIDGET_SERIES_MAX_SERIES,
    WIDGET_SERIES_PERIODS,
    WIDGET_SOURCES_MAX,
    WIDGET_TABLE_ALIGNS,
    WIDGET_TABLE_MAX_COLUMNS,
    WIDGET_TABLE_MAX_ROWS,
    isWidgetUnit,
} from '../widgets';

const ToneName = z.string().regex(/^[a-z0-9-]+$/);

const QueryValue = z.union([z.string(), z.number(), z.boolean()]);

const WidgetQuery = z.record(z.string(), z.union([QueryValue, z.array(QueryValue)]));

const FractionDigits = z.number().int().min(0).max(20);

export const WidgetNumberFormat = z
    .looseObject({
        style: z.enum(WIDGET_FORMAT_STYLES).optional().meta({
            description:
                '`decimal` (the default), `percent` (`0.12` is `12%`), `currency` (with `currency`) or `unit` (with `unit`).',
        }),
        currency: z
            .enum(CURRENCY_CODES)
            .optional()
            .meta({ description: 'With `style: "currency"`: an ISO 4217 code, `USD`.' }),
        currencyDisplay: z.enum(WIDGET_FORMAT_CURRENCY_DISPLAYS).optional(),
        unit: z
            .string()
            .refine(isWidgetUnit, {
                message: 'A unit of `Intl.NumberFormat`: `byte`, `megabyte`, `kilometer-per-hour`.',
            })
            .optional()
            .meta({
                description:
                    'With `style: "unit"`: a unit of `Intl.NumberFormat` (`byte`, `kilobyte`, `megabyte`, `gigabyte`, `second`, `minute`, `hour`…), or two of them joined by `-per-`.',
            }),
        unitDisplay: z.enum(WIDGET_FORMAT_UNIT_DISPLAYS).optional(),
        minimumFractionDigits: FractionDigits.optional(),
        maximumFractionDigits: FractionDigits.optional(),
        notation: z.enum(WIDGET_FORMAT_NOTATIONS).optional().meta({
            description: '`compact` writes `1.2K` and `3.4M`.',
        }),
        signDisplay: z.enum(WIDGET_FORMAT_SIGN_DISPLAYS).optional(),
    })
    .superRefine((format, context) => {
        if (format.style === 'currency' && format.currency === undefined) {
            context.addIssue({
                code: 'custom',
                message: 'A `currency` style needs a `currency`.',
                path: ['currency'],
            });
        }
        if (format.style === 'unit' && format.unit === undefined) {
            context.addIssue({
                code: 'custom',
                message: 'A `unit` style needs a `unit`.',
                path: ['unit'],
            });
        }
        if (
            format.minimumFractionDigits !== undefined &&
            format.maximumFractionDigits !== undefined &&
            format.minimumFractionDigits > format.maximumFractionDigits
        ) {
            context.addIssue({
                code: 'custom',
                message: '`minimumFractionDigits` is above `maximumFractionDigits`.',
                path: ['minimumFractionDigits'],
            });
        }
    })
    .meta({
        description:
            'How the numbers of a widget are written: options of `Intl.NumberFormat`, for the locale of the user (decision 0089). `{ "style": "currency", "currency": "USD" }` writes `9.08` as `$9.08`, `{ "style": "unit", "unit": "megabyte" }` as `9.08 MB`.',
    });

export const WidgetAlertSettings = z
    .looseObject({
        query: WidgetQuery.meta({
            description:
                'The filters of the items to count, as query parameters, on top of those of their source: `{ "filter[status]": "failed" }`.',
        }),
        label: z.string().min(1).meta({
            description: 'What they are, written after their count, translated: `failed`.',
        }),
        tone: ToneName.optional().meta({
            description: 'The tone of the count, when it is above 0. `danger` by default.',
        }),
    })
    .meta({
        description:
            'Items of a source that call for attention (decision 0089): counted with the same query and period, and shown as `4 failed` when there are some.',
    });

const SourcePeriod = z.union([z.string().min(1), z.literal(false)]);

export const WidgetSeriesSource = z
    .looseObject({
        resource: z.string().min(1).meta({ description: 'The resource it counts or sums.' }),
        label: z.string().min(1).meta({ description: 'The name of its line, in the legend.' }),
        query: WidgetQuery.optional(),
        measure: z.string().min(1).optional().meta({
            description: '`count` (the default), or `sum:{field}`.',
        }),
        group: z.string().min(1).optional().meta({
            description: '`{period}:{date field}`: `settings.group` of the widget by default.',
        }),
        period: SourcePeriod.optional().meta({
            description:
                "The `date-range` filter of its list that gets the period of the overview: `settings.period` of the widget by default. `false`: it doesn't follow the period.",
        }),
        help: z.string().optional().meta({ description: 'A line under its label in the legend.' }),
        tone: ToneName.optional().meta({
            description: 'The tone of its line, instead of a categorical color.',
        }),
        alert: WidgetAlertSettings.optional(),
    })
    .meta({
        description:
            'A line of a `series` on resources (decision 0089): the count or the sum of a resource per period.',
    });

export const WidgetRowSource = z
    .looseObject({
        resource: z.string().min(1).meta({ description: 'The resource it counts or sums.' }),
        label: z.string().min(1).meta({ description: 'The name of the row.' }),
        query: WidgetQuery.optional(),
        measure: z.string().min(1).optional().meta({
            description: '`count` (the default), or `sum:{field}`.',
        }),
        points: z.string().min(1).optional().meta({
            description:
                '`{period}:{date field}`: the points of its trend. `settings.points` of the widget by default.',
        }),
        period: SourcePeriod.optional().meta({
            description:
                'The `date-range` filter of its list that gets the period of the overview, and the previous one for its change: `settings.period` of the widget by default.',
        }),
        alert: WidgetAlertSettings.optional(),
    })
    .meta({
        description:
            'A row of a `table` on resources (decision 0089): one subject, counted or summed over the period.',
    });

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
        period: z
            .union([z.string().min(1), z.literal(false)])
            .optional()
            .meta({
                description:
                    "In an overview with a `period` (decision 0084). With `resource`: the id of the list's `date-range` filter that gets the days of the chosen period. `false`: the widget doesn't follow the period; a widget with data of its own then gets no `period` parameters.",
            }),
        followsList: z.boolean().optional().meta({
            description:
                "In the summary of a resource (decision 0084): `false` keeps the widget on the whole resource, without the list's current filters and search. Widgets on that resource, and widgets with data of their own, follow the list by default.",
        }),
        format: WidgetNumberFormat.optional().meta({
            description:
                'Built-in types: how their numbers are written (decision 0089). It wins over the `format` of their data, key by key. A sum of `money` is written in its currency without it.',
        }),
        hideEmpty: z.boolean().optional().meta({
            description:
                'Built-in types: `true` hides the widget when its data has nothing to show (a value of 0, no items, no rows), and the grid closes the gap (decision 0089).',
        }),
        goodWhen: z.enum(WIDGET_GOOD_WHEN).optional().meta({
            description:
                'A `metric` or a `table`: whether a rise (`up`) or a fall (`down`) is good news, so that its change from the previous period is colored `success` or `danger`. Neutral without it.',
        }),
        points: z.string().min(1).optional().meta({
            description:
                'With `resource`, for a `metric`: `{period}:{date field}`, the points of its trend line. For a `table`, the default of its rows.',
        }),
        by: z.string().min(1).optional().meta({
            description:
                'With `resource`, for a `metric`: a field of the `groupBy` of the aggregates of the list, whose largest parts are drawn under the number.',
        }),
        split: z
            .string()
            .min(1)
            .optional()
            .meta({
                description: `With \`resource\` and a \`group\` on a period, for a \`series\`: a field of the \`groupBy\` of the aggregates of the list with a filter of its own. A line per value, for the ${WIDGET_SOURCES_MAX} largest, and the rest as "Other".`,
            }),
        sources: z
            .array(WidgetSeriesSource)
            .min(1)
            .max(WIDGET_SOURCES_MAX)
            .optional()
            .meta({
                description: `A \`series\` without \`resource\`: a line per source, at most ${WIDGET_SOURCES_MAX}, each from a resource.`,
            }),
        stacked: z.boolean().optional().meta({
            description: 'A `series` with several lines: stacks them, as areas.',
        }),
        rows: z
            .array(WidgetRowSource)
            .min(1)
            .max(WIDGET_TABLE_MAX_ROWS)
            .optional()
            .meta({
                description: `A \`table\` on resources: its rows, at most ${WIDGET_TABLE_MAX_ROWS}, each a count or a sum of a resource.`,
            }),
    })
    .meta({
        description:
            'The settings of a widget: `resource`, `query`, `measure`, `group`, `target`, `points`, `by` and `split` for the built-in types on a resource, `sources` and `rows` for those on several, `period` in an overview with a period, `followsList` in a summary, `format`, `hideEmpty` and `goodWhen` for how they are drawn, anything else for widgets of plugins.',
    });

export const OverviewPeriod = z
    .looseObject({
        options: z.array(z.enum(OVERVIEW_PERIODS)).min(1).meta({
            description:
                'The periods the user chooses from, in order: `7d`, `30d` and `90d`, the 7, 30 or 90 days ending today; `month`, the current calendar month, from its first day to today; `year`, the last 12 months, from the first day of the month 11 months ago to today. Days are those of the time zone of the browser.',
        }),
        default: z.enum(OVERVIEW_PERIODS).optional().meta({
            description:
                'The period the overview opens on, among `options`. Defaults to the first.',
        }),
    })
    .meta({
        description:
            'One period for the widgets of a dashboard page or a summary, chosen in its header and kept in the URL (`?period=30d`, decision 0084).',
    });

export const Widget = z.looseObject({
    id: z
        .string()
        .min(1)
        .meta({ description: 'Unique in its dashboard: the `{widget}` of its route.' }),
    type: z.string().min(1).meta({
        description:
            'Built-in: `stat` (a number), `series` (lines over days, weeks or months), `list` (a few items), `breakdown` (the parts of a total), `metric` (a number with its change, its trend and its parts) and `table` (rows of numbers). Other types are widgets of plugins.',
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
        format: WidgetNumberFormat.nullable().optional(),
    })
    .meta({ description: 'The data of a `stat` widget: a number (decision 0064).' });

export const SeriesPoint = z.looseObject({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .meta({ description: 'The first day of the period: `2026-10-05`.' }),
    value: z.number(),
});

/** The dates of points must go up: one point per period. */
function checkPointDates(
    points: readonly SeriesPoint[] | null | undefined,
    path: (string | number)[],
    context: z.RefinementCtx,
) {
    (points ?? []).forEach((point, index) => {
        const previous = points?.[index - 1];
        if (previous !== undefined && point.date <= previous.date) {
            context.addIssue({
                code: 'custom',
                message: 'The dates of the points must go up.',
                path: [...path, index, 'date'],
            });
        }
    });
}

export const WidgetAlert = z
    .looseObject({
        value: z.number().meta({ description: 'How many items call for attention.' }),
        label: z.string().meta({
            description: 'What they are, written after their count, translated: `failed`.',
        }),
        tone: ToneName.nullable().optional().meta({
            description: 'The tone of the count, above 0. `danger` by default.',
        }),
    })
    .meta({
        description:
            'A count that calls for attention (decision 0089): `4 failed`, in its tone, shown when it is above 0.',
    });

export const SeriesWidgetSeries = z
    .looseObject({
        key: z.union([z.string(), z.number(), z.boolean()]).nullable().optional().meta({
            description: 'The value it is the line of, for a line per value of a field.',
        }),
        label: z.string().meta({ description: 'Its name, in the legend.' }),
        points: z.array(SeriesPoint).meta({
            description: 'One point per period, the dates going up. A date missing is 0.',
        }),
        total: z.number().nullable().optional().meta({
            description: 'Its total over the points, in the legend.',
        }),
        tone: ToneName.nullable().optional().meta({
            description: 'The tone of its line, instead of a categorical color.',
        }),
        url: z.string().nullable().optional().meta({ description: 'Where its legend links.' }),
        help: z.string().nullable().optional().meta({
            description: 'A line under its label in the legend.',
        }),
        alert: WidgetAlert.nullable().optional(),
    })
    .meta({ description: 'A line of a `series` with several (decision 0089).' });

export const SeriesWidgetData = z
    .looseObject({
        period: z.enum(WIDGET_SERIES_PERIODS).meta({ description: 'The period of each point.' }),
        points: z.array(SeriesPoint).meta({
            description:
                'One point per period, the dates going up. Periods without a value are points at 0. With `series`, the total of the lines per period, or none (`[]`): clients that only draw one line draw it.',
        }),
        series: z
            .array(SeriesWidgetSeries)
            .max(WIDGET_SERIES_MAX_SERIES)
            .optional()
            .meta({
                description: `Several lines, at most ${WIDGET_SERIES_MAX_SERIES}, instead of \`points\` (decision 0089): one chart, with a legend of their labels, totals and help.`,
            }),
        total: z.number().nullable().optional().meta({
            description: 'The total over the points, shown with the line.',
        }),
        format: WidgetNumberFormat.nullable().optional(),
    })
    .superRefine((data, context) => {
        checkPointDates(data.points, ['points'], context);
        data.series?.forEach((series, index) => {
            checkPointDates(series.points, ['series', index, 'points'], context);
        });
    })
    .meta({
        description:
            'The data of a `series` widget: a line of values per period (decision 0064), or several (decision 0089).',
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
        format: WidgetNumberFormat.nullable().optional(),
    })
    .meta({
        description:
            'The data of a `breakdown` widget: the parts of a total, as horizontal bars (decision 0084).',
    });

export const MetricWidgetData = z
    .looseObject({
        value: z.number().meta({ description: 'The number, in large type.' }),
        previous: z.number().nullable().optional().meta({
            description:
                'The same number over the previous period, of the same length (`getPreviousRange()`): the change from it is written under the number.',
        }),
        help: z.string().nullable().optional().meta({
            description: 'A line under the number, translated.',
        }),
        tone: ToneName.nullable().optional().meta({
            description: 'A tone of the theme, only when the number calls for attention.',
        }),
        url: z.string().nullable().optional().meta({
            description: 'Where the number links: the list of what it counts.',
        }),
        target: z.number().positive().nullable().optional().meta({
            description: 'A target for the number, drawn as a meter under it, as for a `stat`.',
        }),
        points: z.array(SeriesPoint).nullable().optional().meta({
            description:
                'Its trend: one point per period, the dates going up, drawn as a small line.',
        }),
        period: z.enum(WIDGET_SERIES_PERIODS).nullable().optional().meta({
            description: 'The period of each point.',
        }),
        parts: z
            .array(BreakdownWidgetItem)
            .max(WIDGET_BREAKDOWN_MAX_ITEMS)
            .nullable()
            .optional()
            .meta({
                description: `Its largest parts, at most ${WIDGET_BREAKDOWN_MAX_ITEMS}: clients draw the 5 largest as bars, and the rest with \`other\`.`,
            }),
        other: z.number().nullable().optional().meta({
            description: 'The rest of the value, past the parts: drawn last, as "Other".',
        }),
        format: WidgetNumberFormat.nullable().optional(),
    })
    .superRefine((data, context) => {
        checkPointDates(data.points, ['points'], context);
    })
    .meta({
        description:
            'The data of a `metric` widget: one subject in one card, its number, its change from the previous period, its trend and its parts (decision 0089).',
    });

export const TableWidgetColumn = z
    .looseObject({
        key: z.string().min(1).meta({ description: 'The key of its cells in each row.' }),
        label: z.string().meta({ description: 'Its header, translated.' }),
        align: z.enum(WIDGET_TABLE_ALIGNS).optional().meta({
            description: '`end` (the default) for numbers, or `start`.',
        }),
        format: WidgetNumberFormat.nullable().optional().meta({
            description: 'How its numbers are written: the `format` of the widget by default.',
        }),
    })
    .meta({ description: 'A column of a `table` widget.' });

export const TableWidgetCell = z
    .union([
        z.number(),
        z.null(),
        z.looseObject({
            value: z.number().nullable().meta({ description: 'The number, `null` for none.' }),
            tone: ToneName.nullable().optional().meta({
                description: 'A tone, only when the number calls for attention.',
            }),
            help: z.string().nullable().optional().meta({
                description: 'A word after the number, translated: `rejected` in `6 rejected`.',
            }),
            format: WidgetNumberFormat.nullable().optional().meta({
                description: 'How this number is written, instead of the format of its column.',
            }),
        }),
    ])
    .meta({
        description:
            'A cell of a `table` widget: a number, `null` for none, or a number with a tone and a word.',
    });

export const TableWidgetRow = z
    .looseObject({
        label: z.string().meta({ description: 'What the row is about, in its first column.' }),
        url: z.string().nullable().optional().meta({ description: 'Where its label links.' }),
        cells: z.record(z.string(), TableWidgetCell).meta({
            description: 'Its cells, by the `key` of their column. A cell missing is empty.',
        }),
        points: z.array(SeriesPoint).nullable().optional().meta({
            description: 'Its trend, drawn as a small line in a last column: the dates going up.',
        }),
    })
    .meta({ description: 'A row of a `table` widget: one subject.' });

export const TableWidgetData = z
    .looseObject({
        columns: z
            .array(TableWidgetColumn)
            .min(1)
            .max(WIDGET_TABLE_MAX_COLUMNS)
            .meta({
                description: `Its columns of numbers, at most ${WIDGET_TABLE_MAX_COLUMNS}, after the column of the labels.`,
            }),
        rows: z
            .array(TableWidgetRow)
            .max(WIDGET_TABLE_MAX_ROWS)
            .meta({ description: `Its rows, at most ${WIDGET_TABLE_MAX_ROWS}.` }),
        period: z.enum(WIDGET_SERIES_PERIODS).nullable().optional().meta({
            description: 'The period of the points of the rows.',
        }),
        empty: z.string().nullable().optional().meta({
            description: 'The message without rows, translated.',
        }),
        url: z.string().nullable().optional().meta({ description: 'Where "See all" links.' }),
        format: WidgetNumberFormat.nullable().optional(),
    })
    .superRefine((data, context) => {
        const keys = new Set<string>();
        data.columns.forEach((column, index) => {
            if (keys.has(column.key)) {
                context.addIssue({
                    code: 'custom',
                    message: `Duplicate column key \`${column.key}\`.`,
                    path: ['columns', index, 'key'],
                });
            }
            keys.add(column.key);
        });
        data.rows.forEach((row, index) => {
            checkPointDates(row.points, ['rows', index, 'points'], context);
        });
    })
    .meta({
        description:
            'The data of a `table` widget: rows of numbers, one per subject, with an optional trend (decision 0089).',
    });

/** The schema of the data of each built-in widget type. */
export const widgetDataSchemas = {
    stat: StatWidgetData,
    series: SeriesWidgetData,
    list: ListWidgetData,
    breakdown: BreakdownWidgetData,
    metric: MetricWidgetData,
    table: TableWidgetData,
} as const;

export type OverviewPeriod = z.infer<typeof OverviewPeriod>;
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
export type WidgetNumberFormat = z.infer<typeof WidgetNumberFormat>;
export type WidgetAlertSettings = z.infer<typeof WidgetAlertSettings>;
export type WidgetSeriesSource = z.infer<typeof WidgetSeriesSource>;
export type WidgetRowSource = z.infer<typeof WidgetRowSource>;
export type WidgetAlert = z.infer<typeof WidgetAlert>;
export type SeriesWidgetSeries = z.infer<typeof SeriesWidgetSeries>;
export type MetricWidgetData = z.infer<typeof MetricWidgetData>;
export type TableWidgetColumn = z.infer<typeof TableWidgetColumn>;
export type TableWidgetCell = z.infer<typeof TableWidgetCell>;
export type TableWidgetRow = z.infer<typeof TableWidgetRow>;
export type TableWidgetData = z.infer<typeof TableWidgetData>;
