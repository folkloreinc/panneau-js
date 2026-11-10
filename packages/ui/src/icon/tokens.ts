import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Icon. */
export const iconTokens = defineComponentTokens('icon', {
    /**
     * Width of the stroke, in units of the icon's 24-unit grid (Lucide's), so that it scales with
     * the icon: `2` is about 1.33px at 16px and 2px at 24px.
     */
    'stroke-width': '2',
});
