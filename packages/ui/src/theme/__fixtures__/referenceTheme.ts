import { defineTheme } from '../defineTheme';

declare module '../tones' {
    interface PanneauTones {
        signal: true;
        members: true;
    }
}

declare module '../../badge/Badge' {
    interface BadgeVariants {
        tag: true;
    }
}

declare module '../../button/Button' {
    interface ButtonVariants {
        pill: true;
    }
}

/**
 * The reference theme: as different from the default as a project's theme could be (warm
 * surfaces, a green accent, near-black selections, square corners, serif headings, larger
 * controls, soft focus rings, outlined filled buttons, added tones and named variants). It is
 * not public API. Storybook offers it in its toolbar, and the stories, their axe checks and
 * `checkTheme()` run against it, so that every component proves it follows the theme (decisions
 * 0024 and 0073).
 */
export const referenceTheme = defineTheme({
    label: 'Reference',
    palette: {
        forest: '#14532d',
        moss: '#8fd3a8',
        rust: '#c2410c',
    },
    tokens: {
        'panneau-color-bg': '#f7f4ec',
        'panneau-color-surface': '#fffdf7',
        'panneau-color-surface-sunken': '#efe9dc',
        'panneau-color-surface-raised': '#ffffff',
        'panneau-color-text': '#1d1b16',
        'panneau-color-text-muted': '#5c564a',
        'panneau-color-link': '#0f5c3a',
        'panneau-color-border': '#ddd4c2',
        'panneau-color-border-control': '#857c6b',
        'panneau-color-accent': 'var(--panneau-palette-forest)',
        'panneau-color-accent-hover': '#0f3f22',
        'panneau-color-accent-text': '#ffffff',
        'panneau-color-accent-subtle': '#e3efe6',
        'panneau-color-focus': '#b45309',
        'panneau-font-family-heading': "Georgia, 'Times New Roman', serif",
        'panneau-radius-sm': '0',
        'panneau-radius-md': '0',
        'panneau-radius-lg': '0',
        'panneau-shadow-sm': 'none',
        'panneau-heading-1-letter-spacing': '-0.02em',
        'panneau-heading-1-font-weight': 'var(--panneau-font-weight-normal)',
        'panneau-heading-2-font-weight': 'var(--panneau-font-weight-normal)',
        'panneau-button-font-weight': 'var(--panneau-font-weight-bold)',
        'panneau-card-border-width': '2px',
        // Selections apart from the accent: near black, as Bootstrap's component-active-bg can be
        'panneau-selected-bg': '#1d1b16',
        'panneau-selected-text': '#fffdf7',
        'panneau-selected-subtle': '#efe9dc',
        // A soft, wide focus ring on inputs, outlined filled buttons that sink when pressed
        'panneau-input-border-color-focus': '#1d1b16',
        'panneau-input-focus-ring': '0 0 0 3px rgb(180 83 9 / 0.3)',
        'panneau-input-focus-ring-invalid': '0 0 0 3px rgb(185 28 28 / 0.25)',
        'panneau-button-solid-border-color': '#1d1b16',
        'panneau-button-pressed-scale': '0.97',
        'panneau-field-required-color': 'var(--panneau-palette-rust)',
        // An empty switch track, outlined
        'panneau-switch-track-bg': 'var(--panneau-color-surface)',
        'panneau-switch-track-border-color': 'var(--panneau-color-border-control)',
        'panneau-switch-thumb-bg': 'var(--panneau-color-border-control)',
    },
    dark: {
        'panneau-color-bg': '#12140f',
        'panneau-color-surface': '#1b1e17',
        'panneau-color-surface-sunken': '#15170f',
        'panneau-color-surface-raised': '#23271e',
        'panneau-color-text': '#f1ede2',
        'panneau-color-text-muted': '#b4ad9c',
        'panneau-color-link': '#8fd3a8',
        'panneau-color-border': '#34382c',
        'panneau-color-border-control': '#7f7968',
        'panneau-color-accent': 'var(--panneau-palette-moss)',
        'panneau-color-accent-hover': '#a9e0bd',
        'panneau-color-accent-text': '#10200f',
        'panneau-color-accent-subtle': '#23331f',
        'panneau-color-focus': '#f59e0b',
        'panneau-selected-bg': '#f1ede2',
        'panneau-selected-text': '#1b1e17',
        'panneau-selected-subtle': '#2c3025',
        'panneau-input-border-color-focus': '#f1ede2',
        'panneau-input-focus-ring': '0 0 0 3px rgb(245 158 11 / 0.35)',
        'panneau-button-solid-border-color': '#f1ede2',
        'panneau-field-required-color': '#fb923c',
    },
    densities: {
        comfortable: { 'panneau-control-height': '2.5rem', 'panneau-control-padding-x': '1rem' },
    },
    tones: {
        signal: 'var(--panneau-palette-rust)',
        members: {
            text: '#5b21b6',
            subtle: '#f3eefc',
            border: '#c4b5fd',
            outline: '#5b21b6',
            solid: '#6d28d9',
            solidHover: '#5b21b6',
            solidText: '#ffffff',
            dark: { text: '#c4b5fd', subtle: '#2a2340', border: '#5b21b6' },
        },
    },
    components: {
        badge: {
            variants: {
                tag: {
                    'panneau-badge-radius': '0',
                    'panneau-badge-font-weight': 'var(--panneau-font-weight-bold)',
                },
            },
        },
        button: { variants: { pill: { 'panneau-button-radius': 'var(--panneau-radius-full)' } } },
    },
});
