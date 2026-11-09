import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Button. */
export const buttonTokens = defineComponentTokens('button', {
    /** Space between the icon and the label. */
    gap: 'var(--panneau-space-2)',
    /** Horizontal padding. */
    'padding-x': 'calc(var(--panneau-control-padding-x) + var(--panneau-space-1))',
    /** Font size of the label. */
    'font-size': 'var(--panneau-font-size-md)',
    /** Font weight of the label. */
    'font-weight': 'var(--panneau-font-weight-medium)',
    /** Width of the border. */
    'border-width': 'var(--panneau-border-width)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-md)',
    /** Border color of the solid appearance: a theme can outline its filled buttons. */
    'solid-border-color': 'transparent',
    /** Scale of a pressed button, such as `0.97` for buttons that sink. Not with reduced motion. */
    'pressed-scale': '1',
    /** Horizontal padding of the small size. */
    'padding-x-sm': 'var(--panneau-control-padding-x)',
    /** Font size of the small size. */
    'font-size-sm': 'var(--panneau-font-size-sm)',
});
