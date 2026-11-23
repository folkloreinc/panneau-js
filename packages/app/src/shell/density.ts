import { Rows3, Rows4, Undo2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { appMessages } from '@panneau/intl';
import type { DefinitionTheme } from '@panneau/protocol';
import { type Density, type IconComponent, usePanneauIntl, usePreference } from '@panneau/ui';

/**
 * The densities the user can pick, in the order of the menu (decision 0104): `default` is the
 * density of the definition's theme.
 */
export const DENSITY_CHOICES = ['compact', 'comfortable', 'default'] as const;
export type DensityChoice = (typeof DENSITY_CHOICES)[number];

/** The icon of each density. */
export const DENSITY_ICONS: Record<DensityChoice, IconComponent> = {
    compact: Rows4,
    comfortable: Rows3,
    default: Undo2,
};

const COARSE_POINTER = '(pointer: coarse)';

function subscribe(onChange: () => void) {
    const media = window.matchMedia?.(COARSE_POINTER);
    media?.addEventListener('change', onChange);
    return () => media?.removeEventListener('change', onChange);
}

/** Whether the main pointer is a finger, as the `auto` density reads it. */
function useCoarsePointer(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia?.(COARSE_POINTER).matches ?? false,
        () => false,
    );
}

export interface DensityPreference {
    /** The density of the app: the user's choice, or the definition's. */
    density: Density;
    /** The user's choice, `default` until they make one. */
    choice: DensityChoice;
    /**
     * Keeps the user's choice in the browser. `undefined` when the user can't choose: the
     * definition locks the density (`theme.lockDensity`), or the definition's `auto` density is
     * the touch density, on a touch screen (decision 0072).
     */
    onChange: ((choice: DensityChoice) => void) | undefined;
}

/**
 * The density of the app (decision 0104): the user's choice, remembered in the browser like the
 * color scheme, or the density of the definition's theme, `auto` without one.
 */
export function useDensityPreference(theme: DefinitionTheme | undefined): DensityPreference {
    const [stored, setStored] = usePreference('density', DENSITY_CHOICES);
    const coarse = useCoarsePointer();
    const site = theme?.density ?? 'auto';
    // `auto` keeps its touch targets on touch screens, whatever the user chose elsewhere
    const open = theme?.lockDensity !== true && !(site === 'auto' && coarse);
    const choice = open ? (stored ?? 'default') : 'default';
    return {
        density: choice === 'default' ? site : choice,
        choice,
        onChange: open ? setStored : undefined,
    };
}

/** The commands of the "Go to…" palette for the densities the user hasn't chosen. */
export function useDensityCommands(
    density: DensityChoice | undefined,
    onDensityChange: ((choice: DensityChoice) => void) | undefined,
) {
    const intl = usePanneauIntl();
    return onDensityChange !== undefined
        ? DENSITY_CHOICES.filter((choice) => choice !== density).map((choice) => ({
              id: `density-${choice}`,
              label: intl.formatMessage(appMessages.density, { density: choice }),
              icon: DENSITY_ICONS[choice],
              onAction: () => onDensityChange(choice),
          }))
        : [];
}
