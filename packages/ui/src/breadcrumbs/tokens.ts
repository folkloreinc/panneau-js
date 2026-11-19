import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Breadcrumbs. */
export const breadcrumbsTokens = defineComponentTokens('breadcrumbs', {
    /** Space between a crumb and a chevron. */
    gap: 'var(--panneau-space-1)',
    /** Font size. */
    'font-size': 'var(--panneau-font-size-sm)',
    /** Color of the links. */
    'link-color': 'var(--panneau-color-text-muted)',
    /** Color of the current page. */
    'current-color': 'var(--panneau-color-text)',
    /** Font weight of the current page. */
    'current-font-weight': 'var(--panneau-font-weight-medium)',
    /** Color of the chevrons. */
    'separator-color': 'var(--panneau-color-text-muted)',
    /** Widest crumb: a longer label is cut with an ellipsis. */
    'item-max-width': '16rem',
});
