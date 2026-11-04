import type { Field } from '@panneau/protocol';

/**
 * A color of a palette (`settings.palette` of a `color` field, decision 0059): `value` is what the
 * field stores, `color` (hexadecimal) draws its swatch, and `label` names it. Without `color`,
 * `value` is a hexadecimal color, which draws itself.
 */
export interface ColorPaletteEntry {
    value: string;
    label?: string;
    color?: string;
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Whether a value is a hexadecimal color: `#1d4ed8`, `#fff` or `#1d4ed880`. */
export function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && HEX.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The colors of a palette, from a field's `settings.palette`: entries with a `value`, and the
 * `label` and `color` they have. `null` when it has none.
 */
export function toColorPalette(value: unknown): ColorPaletteEntry[] | null {
    if (!Array.isArray(value)) {
        return null;
    }
    const palette = value.flatMap((entry): ColorPaletteEntry[] =>
        isRecord(entry) && typeof entry.value === 'string' && entry.value !== ''
            ? [
                  {
                      value: entry.value,
                      ...(typeof entry.label === 'string' ? { label: entry.label } : {}),
                      ...(isHexColor(entry.color) ? { color: entry.color } : {}),
                  },
              ]
            : [],
    );
    return palette.length > 0 ? palette : null;
}

/** The palette of a `color` field (`settings.palette`), or `null` when it has none. */
export function getColorPalette(field: Field | null | undefined): ColorPaletteEntry[] | null {
    return toColorPalette(field?.settings?.palette);
}

/** The color that draws an entry's swatch: its `color`, or its value when it is hexadecimal. */
export function getSwatchColor(entry: ColorPaletteEntry): string | null {
    return entry.color ?? (isHexColor(entry.value) ? entry.value : null);
}
