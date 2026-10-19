/**
 * The tokens of one component: CSS variables named `--panneau-<component>-<token>`, with their
 * default values (decision 0024).
 */
export interface ComponentTokens<Component extends string = string, Name extends string = string> {
    /**
     * The component or the part it styles: a `data-panneau` hook (`button`, `badge`), or a part
     * shared by several components (`input`, `field`, `list-box`, `calendar`).
     */
    readonly component: Component;
    /** Default values, keyed by token name without the leading `--`: `panneau-button-radius`. */
    readonly tokens: Readonly<Record<Name, string>>;
}

/**
 * Declares the tokens of a component, as `{ <token>: <default> }`. Each token becomes the CSS
 * variable `--panneau-<component>-<token>`.
 *
 * The component's CSS reads every token with its default as the fallback,
 * `var(--panneau-button-radius, var(--panneau-radius-md))`, and never declares it: a value set by a
 * theme, a scope or any ancestor element then reaches the component, and semantic tokens resolve
 * where the component is. A test checks that the CSS and this declaration agree.
 */
export function defineComponentTokens<
    const Component extends string,
    const Tokens extends Record<string, string>,
>(
    component: Component,
    tokens: Tokens,
): ComponentTokens<Component, `panneau-${Component}-${keyof Tokens & string}`> {
    return {
        component,
        tokens: Object.freeze(
            Object.fromEntries(
                Object.entries(tokens).map(([name, value]) => [
                    `panneau-${component}-${name}`,
                    value,
                ]),
            ),
        ) as Record<`panneau-${Component}-${keyof Tokens & string}`, string>,
    };
}
