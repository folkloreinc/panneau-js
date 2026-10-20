import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Prose. Its headings use the tokens of Heading. */
export const proseTokens = defineComponentTokens('prose', {
    /** Line height of the content. */
    'line-height': '1.6',
    /** Space between blocks: paragraphs, lists, tables. */
    gap: 'var(--panneau-space-4)',
    /** Space above a heading. */
    'heading-gap': 'var(--panneau-space-6)',
    /** Indent of lists. */
    'list-indent': '1.5em',
    /** Color of links. */
    'link-color': 'var(--panneau-color-link)',
    /** Font size of code, relative to the text around it. */
    'code-font-size': '0.875em',
    /** Text color of code: inherited, so that a site's global `code` color doesn't apply. */
    'code-color': 'inherit',
    /** Background of code and code blocks. */
    'code-bg': 'var(--panneau-color-surface-sunken)',
    /** Corner radius of code and code blocks. */
    'code-radius': 'var(--panneau-radius-sm)',
    /** Border of quotes. */
    'quote-border-color': 'var(--panneau-color-border)',
    /** Text color of quotes and captions. */
    'quote-color': 'var(--panneau-color-text-muted)',
    /** Color of the borders of tables and of horizontal rules. */
    'border-color': 'var(--panneau-color-border)',
});
