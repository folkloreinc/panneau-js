import { CONTEXT_HEADER, CONTEXT_PROBLEM_TYPE } from '../constants';
import { formatContextHeader } from '../context';
import { Definition } from '../schemas';
import { ContextOptionsResponse } from '../schemas/api';
import { UNKNOWN } from './check';
import { type ConformanceRun } from './run';

/**
 * The context of a backend (decision 0045): the choices of its params, and the definition built for
 * a value.
 */
export async function checkContext(ctx: ConformanceRun): Promise<void> {
    const { options, request, run } = ctx;
    const { definition } = ctx.state;

    // The context (decision 0045): the choices of its params, a definition built for a value,
    // and a value that doesn't exist refused with a 403.
    const contextParams = () => (definition as Definition | null)?.context?.params ?? [];
    let contextValue: { name: string; value: string } | null = null;

    await run(
        'context.options',
        'GET /context/{param}/options gives the choices of the params of the context',
        async (check) => {
            const params = contextParams();
            if (params.length === 0) {
                check.skip('The definition has no context.');
                return;
            }
            const values: Record<string, string> = {};
            for (const param of params) {
                // The backend sets it from the request: there is nothing to pick
                if (param.fixed === true) {
                    continue;
                }
                let first = param.options?.[0]?.value;
                if (param.options === undefined) {
                    const reply = await request(
                        `/context/${encodeURIComponent(param.name)}/options`,
                        { headers: { [CONTEXT_HEADER]: formatContextHeader(values) } },
                    );
                    if (!check.expectStatus(reply, 200)) {
                        return;
                    }
                    const choices = check.expectSchema(
                        ContextOptionsResponse,
                        reply.body,
                        `The choices of "${param.name}"`,
                    );
                    first = choices?.data[0]?.value;
                }
                const value = options.context?.[param.name] ?? first;
                if (value === undefined) {
                    return;
                }
                values[param.name] = value;
                contextValue ??= { name: param.name, value };
            }
        },
    );

    await run(
        'context.value',
        'GET /definition is built for the values of Panneau-Context',
        async (check) => {
            const chosen = contextValue as { name: string; value: string } | null;
            if (chosen === null) {
                check.skip(
                    contextParams().length === 0
                        ? 'The definition has no context.'
                        : 'No choice of the first param to send.',
                );
                return;
            }
            const reply = await request('/definition', {
                headers: { [CONTEXT_HEADER]: formatContextHeader({ [chosen.name]: chosen.value }) },
            });
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const built = check.expectSchema(Definition, reply.body, 'The definition');
            const param = built?.context?.params.find(({ name }) => name === chosen.name);
            check.expect(
                param?.value === chosen.value,
                `The definition was built for ${chosen.name}=${String(param?.value ?? null)}, expected ${chosen.value}.`,
            );
        },
    );

    await run(
        'context.refused',
        'A value of the context that does not exist is a 403 context problem',
        async (check) => {
            const param = contextParams()[0];
            if (param === undefined) {
                check.skip('The definition has no context.');
                return;
            }
            const reply = await request('/definition', {
                headers: { [CONTEXT_HEADER]: formatContextHeader({ [param.name]: UNKNOWN }) },
            });
            const problem = check.expectProblem(reply, 403);
            if (problem !== null) {
                check.expect(
                    problem.type === CONTEXT_PROBLEM_TYPE,
                    `Expected the type ${CONTEXT_PROBLEM_TYPE}, got ${problem.type}.`,
                );
                check.expect(
                    problem.param === param.name,
                    `Expected the param "${param.name}", got ${String(problem.param ?? 'none')}.`,
                );
            }
        },
    );
}
