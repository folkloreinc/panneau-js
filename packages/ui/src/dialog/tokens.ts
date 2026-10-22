import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Dialog. */
export const dialogTokens = defineComponentTokens('dialog', {
    /** Color of the backdrop. */
    backdrop: 'var(--panneau-color-backdrop)',
    /** Maximum width of the default size. */
    width: '32rem',
    /** Maximum width of the small size. */
    'width-sm': '24rem',
    /** Maximum width of the large size. */
    'width-lg': '48rem',
    /** Maximum width of the extra large size, for pickers and editors. */
    'width-xl': '72rem',
    /** Background. */
    bg: 'var(--panneau-color-surface-raised)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow. */
    shadow: 'var(--panneau-shadow-lg)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-5)',
    /** Font size of the title. */
    'title-font-size': 'var(--panneau-font-size-lg)',
    /** Font weight of the title. */
    'title-font-weight': 'var(--panneau-font-weight-bold)',
});
