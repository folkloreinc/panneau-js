import type { Theme } from './schemas/theme';

/** A theme to merge: `tokens` can be left out, as in the theme of a definition. */
export type PartialTheme = Partial<Theme>;

function mergeRecords<T>(
    first: Record<string, T> | undefined,
    second: Record<string, T> | undefined,
): Record<string, T> | undefined {
    return first === undefined && second === undefined ? undefined : { ...first, ...second };
}

function mergeComponents(
    first: Theme['components'],
    second: Theme['components'],
): Theme['components'] {
    const components = mergeRecords(first, second);
    if (components === undefined) {
        return undefined;
    }
    return Object.fromEntries(
        Object.keys(components).map((component) => {
            const before = first?.[component];
            const after = second?.[component];
            const variants = mergeRecords(before?.variants, after?.variants);
            return [
                component,
                {
                    ...before,
                    ...after,
                    ...(variants !== undefined && {
                        variants: Object.fromEntries(
                            Object.keys(variants).map((name) => [
                                name,
                                { ...before?.variants?.[name], ...after?.variants?.[name] },
                            ]),
                        ),
                    }),
                },
            ];
        }),
    );
}

/**
 * Merges themes, in order: each one overrides the tokens, palette colors, tones and variants of
 * those before it. A token a theme sets in `tokens` but not in `dark` applies to both schemes, so it
 * also replaces the dark value of earlier themes. Variants merge token by token; tones are replaced
 * whole. The label is the last one set. `defineTheme()` of `@panneau/ui` merges the same way.
 */
export function mergeThemes(...themes: readonly PartialTheme[]): Theme {
    return themes.reduce<Theme>(
        (merged, theme) => {
            const tokens = theme.tokens ?? {};
            const dark = mergeRecords(
                merged.dark !== undefined
                    ? Object.fromEntries(
                          Object.entries(merged.dark).filter(
                              ([name]) => !Object.hasOwn(tokens, name),
                          ),
                      )
                    : undefined,
                theme.dark,
            );
            const result: Theme = {
                ...merged,
                ...theme,
                label: theme.label ?? merged.label,
                tokens: { ...merged.tokens, ...tokens },
                dark: dark !== undefined && Object.keys(dark).length > 0 ? dark : undefined,
                palette: mergeRecords(merged.palette, theme.palette),
                tones: mergeRecords(merged.tones, theme.tones),
                components: mergeComponents(merged.components, theme.components),
            };
            return Object.fromEntries(
                Object.entries(result).filter(([, value]) => value !== undefined),
            ) as Theme;
        },
        { tokens: {} },
    );
}
