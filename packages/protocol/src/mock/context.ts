// The context of a mock backend.
import { CONTEXT_PROBLEM_TYPE } from '../constants';
import { type ContextValues, contextBefore, parseContextHeader } from '../context';
import type { ContextOption, DefinitionInput } from '../schemas';
import { problem } from './http';
import type { MockState } from './state';

/**
 * The context of a mock backend (decision 0045): the choices of its params, and the values of a
 * request.
 */
export function createMockContext(state: MockState) {
    const { options, definition } = state;
    const params = definition.context?.params ?? [];
    const names = params.map(({ name }) => name);
    const choicesOf = (name: string, values: ContextValues): ContextOption[] => {
        const param = params.find((candidate) => candidate.name === name);
        return (
            param?.options ??
            options.context?.options?.(name, contextBefore(values, names, name)) ??
            []
        );
    };
    const refused = (name: string) =>
        problem(403, 'This value of the context can’t be used.', {
            type: CONTEXT_PROBLEM_TYPE,
            param: name,
        });
    /**
     * The values of the header that the definition declares, each one checked against its
     * choices, in order: a value that isn't one is a `403` problem with its `param`. A `fixed`
     * param has the value of the definition, as a backend would take it from the request: another
     * value in the header is refused.
     */
    const readContext = (header: string | null): ContextValues | Response => {
        const sent = parseContextHeader(header);
        const values: Record<string, string> = {};
        for (const param of params) {
            const { name } = param;
            const value = sent[name];
            if (param.fixed === true && typeof param.value === 'string') {
                if (value !== undefined && value !== param.value) {
                    return refused(name);
                }
                values[name] = param.value;
                continue;
            }
            if (value === undefined) {
                continue;
            }
            if (!choicesOf(name, values).some((choice) => choice.value === value)) {
                return refused(name);
            }
            values[name] = value;
        }
        return values;
    };

    /** The definition for the values of the context: the `value` and `valueLabel` of each param. */
    const definitionFor = (values: ContextValues): DefinitionInput =>
        definition.context === undefined
            ? definition
            : {
                  ...definition,
                  context: {
                      ...definition.context,
                      params: params.map((param) => {
                          if (param.fixed === true) {
                              return param;
                          }
                          const value = values[param.name] ?? null;
                          const label =
                              value !== null
                                  ? choicesOf(param.name, values).find(
                                        (choice) => choice.value === value,
                                    )?.label
                                  : undefined;
                          return { ...param, value, valueLabel: label ?? null };
                      }),
                  },
              };

    return { names, choicesOf, readContext, definitionFor };
}
