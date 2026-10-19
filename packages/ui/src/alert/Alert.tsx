import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import { IconButton } from '../icon-button/IconButton';
import { Icon, type IconComponent } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Alert.module.css';

/** @deprecated Use `Tone`. */
export type AlertTone = Tone;

/** How an alert uses its tone. */
export type AlertAppearance = 'subtle' | 'outline' | 'solid';

/**
 * Named variants of `Alert`, registered by a theme (`components.alert.variants`). Declare them
 * here so that `variant="banner"` type-checks.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by projects
export interface AlertVariants {}

const TONE_ICONS: Partial<Record<Tone, IconComponent>> = {
    neutral: Info,
    success: CircleCheck,
    danger: CircleAlert,
    warning: TriangleAlert,
    info: Info,
};

export interface AlertProps {
    /** Defaults to `neutral`. */
    tone?: Tone;
    /** Defaults to `subtle`. */
    appearance?: AlertAppearance;
    /** A named variant of the theme. */
    variant?: keyof AlertVariants & string;
    title?: ReactNode;
    children?: ReactNode;
    /** Replaces the icon of the tone (an info icon for tones added by a theme). `null` hides it. */
    icon?: IconComponent | null;
    /** Buttons under the message. */
    actions?: ReactNode;
    /** Shows a close button. */
    onDismiss?: () => void;
    /**
     * `alert` announces the message as soon as it appears, for errors that need attention.
     * `status` announces it politely. Without a role, it is only read in place.
     */
    role?: 'alert' | 'status';
    id?: string;
    /** Makes the alert focusable, to move focus to it (an error summary). */
    tabIndex?: number;
    ref?: Ref<HTMLDivElement>;
    className?: string;
    titleClassName?: string;
    bodyClassName?: string;
}

/** A message inside the page: an error summary, a warning, a confirmation. */
export function Alert({
    tone = 'neutral',
    appearance = 'subtle',
    variant,
    title,
    children,
    icon,
    actions,
    onDismiss,
    role,
    id,
    tabIndex,
    ref,
    className,
    titleClassName,
    bodyClassName,
}: AlertProps) {
    const intl = usePanneauIntl();
    const shown = icon === undefined ? (TONE_ICONS[tone] ?? Info) : icon;
    return (
        <div
            ref={ref}
            id={id}
            role={role}
            tabIndex={tabIndex}
            className={cx(
                'panneau-alert',
                styles.alert,
                toneClass(tone),
                styles[appearance],
                variant !== undefined && `panneau-alert-variant-${variant}`,
                className,
            )}
        >
            {shown !== null ? <Icon icon={shown} size="lg" className={styles.icon} /> : null}
            <div className={styles.content}>
                {title !== undefined && title !== null ? (
                    <div className={cx(styles.title, titleClassName)}>{title}</div>
                ) : null}
                {children !== undefined && children !== null ? (
                    <div className={cx(styles.body, bodyClassName)}>{children}</div>
                ) : null}
                {actions !== undefined && actions !== null ? (
                    <div className={styles.actions}>{actions}</div>
                ) : null}
            </div>
            {onDismiss !== undefined ? (
                <IconButton
                    icon={X}
                    size="sm"
                    label={intl.formatMessage(messages.close)}
                    showTooltip={false}
                    onPress={onDismiss}
                    className={styles.dismiss}
                />
            ) : null}
        </div>
    );
}
