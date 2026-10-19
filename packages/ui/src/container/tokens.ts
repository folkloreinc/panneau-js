import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Container. */
export const containerTokens = defineComponentTokens('container', {
    /** Maximum width of the `sm` size. */
    'width-sm': '40rem',
    /** Maximum width of the `md` size. */
    'width-md': '48rem',
    /** Maximum width of the `lg` size, the default. */
    'width-lg': '64rem',
    /** Maximum width of the `xl` size. */
    'width-xl': '80rem',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-4)',
});
