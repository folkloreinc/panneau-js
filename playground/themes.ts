import '@panneau/app';
import { defineTheme } from '@panneau/ui';

/**
 * A flat frame, through the tokens of the shell: the sidebar on a surface with a border, and the
 * page flush against it, without the inset panel of the default.
 */
export const flatTheme = defineTheme({
    tokens: {
        'panneau-shell-bg': 'var(--panneau-color-surface)',
        'panneau-shell-inset': '0',
        'panneau-shell-panel-border': '0 none',
        'panneau-shell-panel-radius': '0',
        'panneau-shell-panel-shadow': 'none',
        'panneau-sidebar-width': '14.5rem',
        'panneau-sidebar-bg': 'var(--panneau-color-surface)',
        'panneau-sidebar-border': 'var(--panneau-border-width) solid var(--panneau-color-border)',
        'panneau-sidebar-link-current-bg': 'var(--panneau-color-surface-sunken)',
        'panneau-sidebar-link-current-border': 'transparent',
        'panneau-sidebar-link-current-shadow': 'none',
    },
});
