import { z } from 'zod';

/** Names of tones, palette colors, components and variants: they become CSS class names. */
const Name = z.string().regex(/^[a-z0-9-]+$/);

export const ThemeTokens = z
    .record(z.string().regex(/^[a-zA-Z0-9_-]+$/), z.string().regex(/^[^{};<]*$/))
    .meta({
        description:
            'CSS variables without the leading `--`, and their values: `{ "panneau-color-accent": "#05f" }`. Values cannot contain `{`, `}`, `;` or `<`.',
    });

export const ToneValues = z.looseObject({
    text: z.string().meta({ description: 'Text and icons on surfaces.' }),
    subtle: z.string().meta({ description: 'Background of the subtle appearance.' }),
    border: z.string().meta({ description: 'Border of the subtle appearance.' }),
    outline: z.string().meta({ description: 'Border of the outline appearance.' }),
    solid: z.string().meta({ description: 'Background of the solid appearance.' }),
    solidHover: z.string().meta({ description: 'Background of the solid appearance on hover.' }),
    solidText: z.string().meta({ description: 'Text on the solid appearance.' }),
});

export const ToneInput = z
    .union([
        z.string().meta({ description: 'One color, from which Panneau derives the others.' }),
        ToneValues.extend({ dark: ToneValues.partial().optional() }),
    ])
    .meta({ description: 'A tone: one color, or every value with dark scheme overrides.' });

const themeShape = {
    label: z.string().optional(),
    tokens: ThemeTokens.meta({
        description:
            'Tokens of the light scheme, or of both schemes when `dark` does not set them.',
    }),
    dark: ThemeTokens.optional().meta({ description: 'Tokens that change in the dark scheme.' }),
    palette: z
        .record(Name, z.string().regex(/^[^{};<]*$/))
        .optional()
        .meta({
            description:
                'Raw colors, written as `--panneau-palette-<name>`: tokens and tones use them with `var(--panneau-palette-<name>)`.',
        }),
    tones: z.record(Name, ToneInput).optional().meta({
        description: 'Tones added or redefined by the theme, applied by `panneau-tone-<name>`.',
    }),
    components: z
        .record(Name, z.looseObject({ variants: z.record(Name, ThemeTokens).optional() }))
        .optional()
        .meta({
            description:
                'Named variants of components: tokens applied by `panneau-<component>-variant-<name>`.',
        }),
};

export const Theme = z
    .looseObject(themeShape)
    .meta({ description: 'A theme of `@panneau/ui`, as plain data (decision 0024).' });

export const DefinitionTheme = z
    .looseObject({
        ...themeShape,
        tokens: themeShape.tokens.optional(),
        colorScheme: z.enum(['light', 'dark', 'auto']).optional(),
        extends: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .meta({
                description:
                    'Themes registered by plugins, by id, that this theme builds on, in order: its own values override theirs.',
            }),
    })
    .meta({ description: 'The theme of the admin: a theme, built on themes of plugins.' });

export type ThemeTokens = z.infer<typeof ThemeTokens>;
export type ToneValues = z.infer<typeof ToneValues>;
export type ToneInput = z.infer<typeof ToneInput>;
export type Theme = z.infer<typeof Theme>;
export type DefinitionTheme = z.infer<typeof DefinitionTheme>;
