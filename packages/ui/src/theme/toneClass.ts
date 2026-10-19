import styles from './Tone.module.css';
import { type Tone, toneClassName } from './tones';

/**
 * The class of a tone, `panneau-tone-<tone>`. The built-in tones come from `Tone.module.css`, whose
 * classes get the same stable names, so using it includes their CSS; a theme's own tones get their
 * rules from the theme.
 */
export function toneClass(tone: Tone): string {
    return (Object.hasOwn(styles, tone) ? styles[tone] : undefined) ?? toneClassName(tone);
}
