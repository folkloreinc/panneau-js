import { createContext, use } from 'react';

import type { ContextOption, ContextParam, Definition } from '@panneau/protocol';

/**
 * The current context of the app (decision 0045): the params of the definition, with the values
 * it was built for, how to search the choices of a param, and how to go to other values.
 */
export interface CurrentContextValue {
    params: readonly ContextParam[];
    /** The first choices of a param that match `q`, for the values of the params before it. */
    getOptions: (name: string, q: string, signal?: AbortSignal) => Promise<ContextOption[]>;
    /**
     * Goes to the app for another value of a param (`null`: none), which drops the values of
     * the params after it. The browser loads the app again.
     */
    select: (name: string, value: string | null) => void;
}

const CurrentContext = createContext<CurrentContextValue | null>(null);

export const CurrentContextProvider = CurrentContext;

/** The current context, or `null` when the definition has none. */
export function useCurrentContext(): CurrentContextValue | null {
    return use(CurrentContext);
}

/** The names of the params of the context of a definition, in order. */
export function getContextNames(definition: Definition | undefined): string[] {
    return (definition?.context?.params ?? []).map(({ name }) => name);
}

/** The values a definition was built for, by name. */
export function getContextValues(definition: Definition | undefined): Record<string, string> {
    return Object.fromEntries(
        (definition?.context?.params ?? []).flatMap(({ name, value }) =>
            typeof value === 'string' && value !== '' ? [[name, value]] : [],
        ),
    );
}

/** Whether a definition was built for these values: those it has agree with them. */
export function isBuiltFor(
    definition: Definition | undefined,
    values: Readonly<Record<string, string>>,
): boolean {
    const built = getContextValues(definition);
    return Object.entries(values).every(([name, value]) => built[name] === value);
}

/** The values to go to for another value of a param: those before it, and the new one. */
export function selectValue(
    params: readonly ContextParam[],
    name: string,
    value: string | null,
): Record<string, string> {
    const index = params.findIndex((param) => param.name === name);
    const values: Record<string, string> = {};
    params.slice(0, Math.max(0, index)).forEach((param) => {
        if (typeof param.value === 'string' && param.value !== '') {
            values[param.name] = param.value;
        }
    });
    if (index >= 0 && value !== null && value !== '') {
        values[name] = value;
    }
    return values;
}
