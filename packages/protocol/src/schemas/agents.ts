// The tools that agents work through, as their user (decisions 0090 and 0106).
import { z } from 'zod';

import { SEARCH_MAX_LIMIT } from '../search';
import { ActionScope } from './action';
import { ActionResult, Item, ListResponse, SearchResponse, Selection } from './api';
import { Abilities, Id, Option } from './common';
import { DefinitionContext } from './definition';
import { Filter } from './list';

/** The tools of an MCP server of Panneau, and whether each one writes (decision 0106). */
export const AGENT_TOOLS = {
    describe: { writes: false },
    find_items: { writes: false },
    get_item: { writes: false },
    save_item: { writes: true },
    run_action: { writes: true },
} as const;
export type AgentToolName = keyof typeof AGENT_TOOLS;

/** The most items a page of `find_items` holds. */
export const AGENT_MAX_PER_PAGE = 50;

export const AgentDescribePart = z.enum(['fields', 'list', 'actions']);

export const AgentField = z
    .looseObject({
        name: z.string().min(1),
        type: z.string().min(1),
        label: z.string().optional(),
        help: z.string().optional(),
        localized: z.boolean().optional().meta({
            description: 'The value is an object keyed by locale, one per locale of the content.',
        }),
        required: z
            .union([z.boolean(), z.enum(['create', 'update'])])
            .optional()
            .meta({
                description:
                    '`create` or `update`: the value is required only when the item is created, or only when it is changed.',
            }),
        multiple: z.boolean().optional().meta({ description: 'The value is a list.' }),
        createOnly: z
            .boolean()
            .optional()
            .meta({ description: 'Only set when the item is created: changes ignore it.' }),
        updateOnly: z
            .boolean()
            .optional()
            .meta({ description: 'Only set when the item is changed: creating ignores it.' }),
        readOnly: z.boolean().optional().meta({
            description: '`save_item` ignores its value: read-only, or not editable by the user.',
        }),
        options: z.array(Option).optional(),
        resource: z
            .union([z.string().min(1), z.array(z.string().min(1))])
            .optional()
            .meta({ description: 'The resource of a relation, whose item ids the value holds.' }),
        example: z.unknown().optional().meta({
            description:
                'An example of the value `save_item` takes, given by the fields whose value is not a plain scalar (a `money`, a `daterange`, an `address`, a `link`).',
        }),
        // The return types are written out so that declaration files keep the recursion.
        get fields(): z.ZodOptional<z.ZodArray<typeof AgentField>> {
            return z.array(AgentField).optional().meta({
                description: 'The fields of the value of a group, or of each item of a repeater.',
            });
        },
        get types(): z.ZodOptional<z.ZodArray<typeof AgentBlockType>> {
            return z.array(AgentBlockType).optional().meta({
                description:
                    'A repeater of blocks: the types of block it takes. Each block of its value has the `type` of one of their ids.',
            });
        },
    })
    .meta({ description: 'A field, as an agent reads it: what it takes, not how it is shown.' });

export const AgentBlockType = z.looseObject({
    id: z.string().min(1),
    label: z.string(),
    get fields(): z.ZodArray<typeof AgentField> {
        return z.array(AgentField);
    },
});

export const AgentAction = z
    .looseObject({
        id: z.string().min(1),
        label: z.string(),
        scope: z.array(ActionScope).min(1),
        fields: z.array(AgentField).optional().meta({ description: 'The `values` it takes.' }),
        destructive: z.boolean().optional(),
        undoable: z.boolean().optional(),
        dryRun: z.boolean().optional().meta({ description: '`run_action` takes `dryRun`.' }),
        confirmation: z.boolean().optional().meta({
            description:
                'A first call answers `confirmation_required` whatever its selection: the action has a `confirm`, or destroys and can not be undone.',
        }),
    })
    .meta({
        description:
            'An action the user can run, declared or built in (`delete`, `restore`, `duplicate`).',
    });

export const AgentResourceDescription = z
    .looseObject({
        id: z.string().min(1),
        label: z.looseObject({ singular: z.string(), plural: z.string() }),
        description: z.string().optional(),
        fields: z.array(AgentField).optional(),
        types: z
            .array(
                z.looseObject({
                    id: z.string().min(1),
                    label: z.string(),
                    description: z.string().optional(),
                    fields: z.array(AgentField),
                }),
            )
            .optional()
            .meta({
                description:
                    'With `fields`, for a resource with types: the `type` an item is created with, and its own fields.',
            }),
        list: z
            .looseObject({
                filters: z.array(Filter).optional(),
                sorts: z.array(z.string().min(1)).optional(),
                defaultSort: z.string().optional().meta({
                    description: 'The `sort` of `find_items` without one: `-published_at`.',
                }),
                search: z.boolean().optional().meta({ description: '`find_items` takes `q`.' }),
            })
            .optional(),
        actions: z.array(AgentAction).optional(),
        abilities: z.record(z.string(), z.boolean()).optional().meta({
            description:
                'What the user can do with the resource, by ability (`viewAny`, `create`).',
        }),
    })
    .meta({
        description:
            'A resource, as `describe` answers it to an agent (decision 0106): no layout, columns, icons or placements. Only the `parts` asked for, all of them by default.',
    });

export const AgentResourceSummary = z.looseObject({
    id: z.string().min(1),
    label: z.looseObject({ singular: z.string(), plural: z.string() }),
    description: z.string().optional(),
    abilities: z.looseObject({ viewAny: z.boolean(), create: z.boolean() }),
});

const issue = (context: z.core.$RefinementCtx, path: string, message: string) =>
    context.addIssue({ code: 'custom', path: [path], message });

const values = z.record(z.string(), z.unknown());

export const AgentDescribeArguments = z
    .strictObject({
        resource: z.string().min(1).optional(),
        parts: z.array(AgentDescribePart).min(1).optional(),
    })
    .superRefine((args, context) => {
        if (args.parts !== undefined && args.resource === undefined) {
            issue(context, 'parts', '`parts` describes a resource: it needs a `resource`.');
        }
    });

export const AgentResourceList = z.looseObject({
    resources: z.array(AgentResourceSummary),
    context: DefinitionContext.optional().meta({
        description: 'The context the connection was made for (decision 0045).',
    }),
});

export const AgentDescribeResult = z.union([AgentResourceList, AgentResourceDescription]);

export const AgentFindItemsArguments = z
    .strictObject({
        resource: z.string().min(1).optional(),
        q: z.string().optional(),
        limit: z.number().int().positive().max(SEARCH_MAX_LIMIT).optional(),
        filter: values.optional().meta({ description: 'By filter id, as `filter` of the list.' }),
        sort: z.string().min(1).optional().meta({ description: 'As `sort`: `-published_at`.' }),
        page: z.number().int().positive().optional(),
        cursor: z.string().min(1).optional(),
        perPage: z.number().int().positive().max(AGENT_MAX_PER_PAGE).optional(),
        fields: z.array(z.string().min(1)).min(1).optional().meta({
            description: "The fields of each item. Defaults to those of the list's columns.",
        }),
    })
    .superRefine((args, context) => {
        if (args.resource === undefined) {
            if (args.q === undefined) {
                issue(context, 'q', 'The global search needs `q`.');
            }
            (['filter', 'sort', 'page', 'cursor', 'perPage', 'fields'] as const).forEach((key) => {
                if (args[key] !== undefined) {
                    issue(context, key, `\`${key}\` lists a resource: it needs a \`resource\`.`);
                }
            });
            return;
        }
        if (args.limit !== undefined) {
            issue(context, 'limit', '`limit` is for the global search: use `perPage`.');
        }
        if (args.page !== undefined && args.cursor !== undefined) {
            issue(context, 'cursor', 'A page is asked by `page` or by `cursor`, not both.');
        }
    });

export const AgentListItem = Item.extend({
    abilities: Abilities.optional().meta({
        description: 'Left out by `find_items`, to keep lists light: `get_item` gives them.',
    }),
}).meta({
    description:
        'An item, as `find_items` answers it: its `id`, `version` and the fields asked for, without its abilities.',
});

export const AgentFindItemsResult = z.union([
    ListResponse.extend({ data: z.array(AgentListItem) }),
    SearchResponse.extend({
        data: z.array(SearchResponse.shape.data.element.extend({ items: z.array(AgentListItem) })),
    }),
]);

export const AgentGetItemArguments = z.strictObject({
    resource: z.string().min(1),
    id: Id,
    fields: z.array(z.string().min(1)).min(1).optional(),
});

export const AgentSaveItemArguments = z
    .strictObject({
        resource: z.string().min(1),
        id: Id.optional().meta({ description: 'The item to change. Without it, creates one.' }),
        version: z.string().nullable().optional().meta({
            description: 'With `id`, required: the `version` of the item the agent read.',
        }),
        type: z.string().min(1).optional().meta({
            description: 'Without `id`, in a resource with types: the type of the new item.',
        }),
        values: values.meta({
            description:
                'By field. Each value replaces the whole value of its field, a group or a repeater too: the fields left out keep theirs.',
        }),
    })
    .superRefine((args, context) => {
        if (args.id !== undefined && args.version === undefined) {
            issue(context, 'version', 'Changing an item needs the `version` it was read at.');
        }
        if (args.id === undefined && args.version !== undefined) {
            issue(context, 'version', '`version` is for changing an item: it needs an `id`.');
        }
        if (args.id !== undefined && args.type !== undefined) {
            issue(context, 'type', 'The type of an item is set when it is created.');
        }
    });

export const AgentRunActionArguments = z.strictObject({
    resource: z.string().min(1),
    action: z.string().min(1),
    selection: Selection.optional().meta({
        description: 'Omitted for actions on the whole resource.',
    }),
    values: values.optional(),
    dryRun: z.boolean().optional(),
    confirmation: z.string().min(1).optional().meta({
        description:
            'The `confirmation` of a `confirmation_required` answer: runs what it previewed, with the same arguments, within 5 minutes.',
    }),
});

export const AgentConfirmationRequired = z
    .looseObject({
        status: z.literal('confirmation_required'),
        message: z.string(),
        preview: ActionResult.extend({
            count: z.number().int().nonnegative().optional().meta({
                description: 'Without a dry run: how many items the selection holds.',
            }),
        }).meta({ description: 'The result of the dry run, or the count of the selection.' }),
        confirmation: z.string().min(1),
    })
    .meta({
        description:
            'The action did not run: the agent shows `message` and `preview` to its user, then calls again with `confirmation`.',
    });

export const AgentRunActionResult = z.union([
    AgentConfirmationRequired,
    ActionResult.extend({
        item: Item.optional().meta({ description: '`duplicate`: the copy.' }),
    }),
]);

/** The schemas of each tool, which `createAgentsJsonSchema` writes to `agents.schema.json`. */
export const agentToolSchemas = {
    describe: { arguments: AgentDescribeArguments, result: AgentDescribeResult },
    find_items: { arguments: AgentFindItemsArguments, result: AgentFindItemsResult },
    get_item: { arguments: AgentGetItemArguments, result: Item },
    save_item: { arguments: AgentSaveItemArguments, result: Item },
    run_action: { arguments: AgentRunActionArguments, result: AgentRunActionResult },
} satisfies Record<AgentToolName, { arguments: z.ZodType; result: z.ZodType }>;

export type AgentDescribePart = z.infer<typeof AgentDescribePart>;
export type AgentField = z.infer<typeof AgentField>;
export type AgentBlockType = z.infer<typeof AgentBlockType>;
export type AgentAction = z.infer<typeof AgentAction>;
export type AgentResourceDescription = z.infer<typeof AgentResourceDescription>;
export type AgentResourceSummary = z.infer<typeof AgentResourceSummary>;
export type AgentResourceList = z.infer<typeof AgentResourceList>;
export type AgentDescribeArguments = z.infer<typeof AgentDescribeArguments>;
export type AgentDescribeResult = z.infer<typeof AgentDescribeResult>;
export type AgentFindItemsArguments = z.infer<typeof AgentFindItemsArguments>;
export type AgentListItem = z.infer<typeof AgentListItem>;
export type AgentFindItemsResult = z.infer<typeof AgentFindItemsResult>;
export type AgentGetItemArguments = z.infer<typeof AgentGetItemArguments>;
export type AgentSaveItemArguments = z.infer<typeof AgentSaveItemArguments>;
export type AgentRunActionArguments = z.infer<typeof AgentRunActionArguments>;
export type AgentConfirmationRequired = z.infer<typeof AgentConfirmationRequired>;
export type AgentRunActionResult = z.infer<typeof AgentRunActionResult>;
