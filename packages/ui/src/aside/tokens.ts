import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Aside: the column next to the main content of a page or a form (decision 0073). */
export const asideTokens = defineComponentTokens('aside', {
    /** Width, beside the content or over it. */
    width: '22rem',
    /** Width once widened, for previews: a share of the layout, or a length. */
    'width-wide': '50%',
    /** Background. */
    bg: 'var(--panneau-color-surface)',
    /** Border, beside or below the content. */
    border: 'var(--panneau-border-width) solid var(--panneau-color-border)',
    /** Corner radius, beside or below the content. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow, beside or below the content. Over it, the shadow of overlays. */
    shadow: 'var(--panneau-shadow-sm)',
    /** Space inside, around the header, the toolbar and the panels. */
    padding: 'var(--panneau-space-4)',
});
