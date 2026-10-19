import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Tabs. */
export const tabsTokens = defineComponentTokens('tabs', {
    /** Space between the tab list and the panel. */
    gap: 'var(--panneau-space-4)',
    /** Color of the line under the tab list. */
    'border-color': 'var(--panneau-color-border)',
    /** Horizontal padding of a tab. */
    'tab-padding-x': 'var(--panneau-space-3)',
    /** Font weight of a tab. */
    'tab-font-weight': 'var(--panneau-font-weight-medium)',
    /** Text color of a tab. */
    'tab-color': 'var(--panneau-color-text-muted)',
    /** Height of the indicator under the selected tab. */
    'indicator-height': '2px',
    /** Text color of a hovered or selected tab. */
    'tab-color-selected': 'var(--panneau-color-text)',
    /** Color of the indicator under the selected tab. */
    'indicator-color': 'var(--panneau-color-accent)',
});
