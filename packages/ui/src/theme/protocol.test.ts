import { describe, expect, it } from 'vitest';

import { type Theme as ThemeData, Theme as ThemeSchema } from '@panneau/protocol';

import { bootstrapTheme } from './bootstrap';
import { defineTheme } from './defineTheme';
import type { Theme } from './theme';

describe('themes as data', () => {
    it('are valid against the Theme schema of @panneau/protocol', () => {
        const theme = defineTheme({
            extends: bootstrapTheme,
            palette: { orange: '#f25c05' },
            tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
            dark: { 'panneau-color-accent': '#ffb38a' },
            tones: {
                signal: '#f25c05',
                members: {
                    text: '#5b21b6',
                    subtle: '#f5f3ff',
                    border: '#c4b5fd',
                    outline: '#5b21b6',
                    solid: '#6d28d9',
                    solidHover: '#5b21b6',
                    solidText: '#ffffff',
                    dark: { text: '#c4b5fd' },
                },
            },
            components: { badge: { variants: { tag: { 'panneau-badge-radius': '0' } } } },
        });
        expect(ThemeSchema.safeParse(bootstrapTheme).success).toBe(true);
        expect(ThemeSchema.safeParse(theme).success).toBe(true);
    });

    it('have the same type in both packages', () => {
        const data: ThemeData = bootstrapTheme;
        const theme: Theme = data;
        expect(theme).toBe(bootstrapTheme);
    });
});
