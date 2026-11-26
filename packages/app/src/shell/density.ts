import { Rows2, Rows3, Rows4 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

import { appMessages } from '@panneau/intl';
import type { DefinitionTheme } from '@panneau/protocol';
import { type Density, type IconComponent, usePanneauIntl } from '@panneau/ui';

/**
 * The densities the user can pick, in the order of the menu (decision 0104): `large` is the
 * `touch` density, for fingers or for those who want roomier controls.
 */
export const DENSITY_CHOICES = ['compact', 'comfortable', 'large'] as const;
export type DensityChoice = (typeof DENSITY_CHOICES)[number];

/** The icon of each density. */
export const DENSITY_ICONS: Record<DensityChoice, IconComponent> = {
    compact: Rows4,
    comfortable: Rows3,
    large: Rows2,
};

const STORAGE_KEY = 'panneau:density';

/** The choice kept in the browser; the old "default" and unknown values read as none. */
function readChoice(): DensityChoice | null {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return DENSITY_CHOICES.find((choice) => choice === value) ?? null;
    } catch {
        return null;
    }
}

function writeChoice(choice: DensityChoice | null) {
    try {
        if (choice === null) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, choice);
        }
    } catch {
        // The choice then lasts until the page is reloaded.
    }
}

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

/** The density of each choice. */
const CHOICE_DENSITY: Record<DensityChoice, Density> = {
    compact: 'compact',
    comfortable: 'comfortable',
    large: 'touch',
};

/** The choice that gives a density, `auto` being comfortable where the user can choose. */
function choiceOf(density: Density): DensityChoice {
    return density === 'touch' ? 'large' : density === 'compact' ? 'compact' : 'comfortable';
}

export interface DensityPreference {
    /** The density of the app: the user's choice, or the definition's. */
    density: Density;
    /** The choice in effect: the user's, or the one that matches the definition's density. */
    choice: DensityChoice;
    /**
     * Keeps the user's choice in the browser; the one that matches the definition's density clears
     * it, so the app follows the definition again. `undefined` when the user can't choose: the
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
    const [stored, setStored] = useState(readChoice);
    const coarse = useCoarsePointer();
    const site = theme?.density ?? 'auto';
    // `auto` keeps its touch targets on touch screens, whatever the user chose elsewhere
    const open = theme?.lockDensity !== true && !(site === 'auto' && coarse);
    const siteChoice = choiceOf(site);
    const chosen = open ? stored : null;
    return {
        density: chosen !== null ? CHOICE_DENSITY[chosen] : site,
        choice: chosen ?? siteChoice,
        onChange: open
            ? (choice) => {
                  // The definition's own density isn't a choice: the app follows the definition
                  const next = choice === siteChoice ? null : choice;
                  setStored(next);
                  writeChoice(next);
              }
            : undefined,
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
