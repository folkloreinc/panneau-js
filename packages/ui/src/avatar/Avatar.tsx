import { type CSSProperties, useState } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Avatar.module.css';
import { getInitials, getNameColorIndex } from './initials';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
    /** The person's name: it gives the initials and the color. */
    name: string;
    /** A picture. If it fails to load, the initials are shown. */
    src?: string | null | undefined;
    /** Defaults to `md` (2.25rem). `sm` (1.75rem) is the size of the shell. */
    size?: AvatarSize;
    /**
     * A ring in the tone's solid color, for a state of the person: disabled (`neutral`), over a
     * limit (`warning`), blocked (`danger`). Say it in words too, with `status` or next to it.
     */
    tone?: Tone | undefined;
    /** The state in words ("Disabled"), added to the label and to the name on hover. */
    status?: string | undefined;
    /**
     * Makes the avatar an image with this name. Without it, the avatar is decorative, as it sits
     * next to the name.
     */
    label?: string | undefined;
    className?: string | undefined;
}

/**
 * A person's picture, or their initials on a tint of a categorical chart color picked from their
 * name: the same person has the same color everywhere.
 */
export function Avatar({ name, src, size = 'md', tone, status, label, className }: AvatarProps) {
    const intl = usePanneauIntl();
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const withStatus = (text: string) =>
        status !== undefined && status !== ''
            ? intl.formatMessage(messages.avatarStatus, { name: text, status })
            : text;
    const image = src !== undefined && src !== null && src !== '' && src !== failedSrc ? src : null;
    const style = {
        '--_panneau-avatar-color': chartColors.categorical(getNameColorIndex(name)),
    } as CSSProperties;
    return (
        <span
            className={cx(
                'panneau-avatar',
                styles.avatar,
                styles[size],
                tone !== undefined && toneClass(tone),
                tone !== undefined && styles.ring,
                className,
            )}
            style={style}
            role={label !== undefined ? 'img' : undefined}
            aria-label={label !== undefined ? withStatus(label) : undefined}
            aria-hidden={label === undefined ? 'true' : undefined}
            title={withStatus(name)}
        >
            {image !== null ? (
                <img
                    src={image}
                    alt=""
                    className={styles.image}
                    onError={() => setFailedSrc(image)}
                />
            ) : (
                <span className={styles.initials}>{getInitials(name, intl.locale)}</span>
            )}
        </span>
    );
}

export { styles as avatarStyles };
