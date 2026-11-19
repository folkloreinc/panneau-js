import {
    ActionResult,
    ActionRun,
    type Definition,
    Definition as DefinitionSchema,
    resolveBlockTypeSets,
    validate,
} from '@panneau/protocol';

import type { ActionResponse } from './adapter';
import { InvalidResponseError } from './errors';

// The checks of the responses that need the schemas of the protocol: the REST adapter loads them
// with an `import()`, with Zod, out of the JavaScript the page loads up front (decision 0095).

/** A definition from `GET /definition`, validated, with its shared block types resolved. */
export function checkDefinition(body: unknown): Definition {
    const result = validate(DefinitionSchema, body);
    if (!result.success) {
        throw new InvalidResponseError('The definition is invalid.', result.issues);
    }
    // The repeaters that name a set of shared block types get its types (decision 0094)
    const issues = resolveBlockTypeSets(result.data);
    if (issues.length > 0) {
        throw new InvalidResponseError('The definition is invalid.', issues);
    }
    return result.data;
}

/** The answer of an action: its run when queued (`202`), its result otherwise, validated. */
export function checkActionResponse(status: number, body: unknown): ActionResponse {
    if (status === 202) {
        const run = validate(ActionRun, (body as { run?: unknown }).run);
        if (!run.success) {
            throw new InvalidResponseError('The action run is invalid.', run.issues);
        }
        return { run: run.data };
    }
    const result = validate(ActionResult, body);
    if (!result.success) {
        throw new InvalidResponseError('The action result is invalid.', result.issues);
    }
    return { result: result.data };
}
