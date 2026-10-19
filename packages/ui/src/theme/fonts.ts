/** A font face of a theme, written as an `@font-face` rule. */
export type ThemeFontFace = {
    /** The family name that font tokens use: `'Geist'`. */
    family: string;
    /** The `src` descriptor: `url(/fonts/geist.woff2) format('woff2')`. */
    src: string;
    /** A weight or a range of a variable font: `400`, `400 700`. */
    weight?: string;
    /** `normal` or `italic`. */
    style?: string;
    /** Defaults to `swap`. */
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    unicodeRange?: string;
};

/** A hosted stylesheet that declares font faces: Google Fonts, Adobe Fonts, a site's own. */
export type ThemeFontStylesheet = {
    stylesheet: string;
};

/**
 * A font of a theme: a face, or a stylesheet that declares faces. `PanneauRoot` adds them to the
 * page once, however many roots use the theme. Font faces are global by nature, unlike tokens.
 */
export type ThemeFont = ThemeFontFace | ThemeFontStylesheet;

/** Values that could break out of an `@font-face` rule, or out of the family name. */
const UNSAFE = /[{}<]/;
const UNSAFE_FAMILY = /[{}<;"\\]/;
const UNSAFE_DESCRIPTOR = /[{}<;]/;

function isFace(font: ThemeFont): font is ThemeFontFace {
    return 'family' in font && 'src' in font;
}

/**
 * The `@font-face` rules of the fonts of a theme. Faces with a value that could break out of the
 * rule are ignored: `{`, `}` or `<` anywhere, `;` outside of `src` (which can hold data URLs), and
 * quotes or backslashes in the family.
 */
export function getFontFaceCss(fonts: readonly ThemeFont[] = []): string {
    return fonts
        .filter(isFace)
        .filter(
            (face) =>
                !UNSAFE_FAMILY.test(face.family) &&
                !UNSAFE.test(face.src) &&
                [face.weight, face.style, face.display, face.unicodeRange].every(
                    (value) => value === undefined || !UNSAFE_DESCRIPTOR.test(value),
                ),
        )
        .map((face) =>
            [
                `@font-face{font-family:"${face.family}";src:${face.src};`,
                face.weight !== undefined ? `font-weight:${face.weight};` : '',
                face.style !== undefined ? `font-style:${face.style};` : '',
                `font-display:${face.display ?? 'swap'};`,
                face.unicodeRange !== undefined ? `unicode-range:${face.unicodeRange};` : '',
                '}',
            ].join(''),
        )
        .join('');
}

/** The URLs of the font stylesheets of a theme, without duplicates. */
export function getFontStylesheets(fonts: readonly ThemeFont[] = []): string[] {
    return [
        ...new Set(
            fonts.flatMap((font) =>
                'stylesheet' in font && typeof font.stylesheet === 'string'
                    ? [font.stylesheet]
                    : [],
            ),
        ),
    ];
}
