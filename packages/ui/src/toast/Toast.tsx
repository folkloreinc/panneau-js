import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { type ReactNode, createContext, use, useState } from 'react';
import {
    UNSTABLE_Toast as AriaToast,
    UNSTABLE_ToastContent as AriaToastContent,
    UNSTABLE_ToastQueue as AriaToastQueue,
    UNSTABLE_ToastRegion as AriaToastRegion,
    Text,
} from 'react-aria-components';

import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { Icon, type IconComponent } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { cx } from '../utils/cx';
import styles from './Toast.module.css';

export type ToastTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

/** What a toast says. */
export interface ToastContent {
    title: string;
    description?: string;
    /** Defaults to `neutral`. */
    tone?: ToastTone;
    /** A button in the toast, such as "Retry" or "Undo". The toast closes when it is pressed. */
    action?: { label: string; onAction: () => void };
}

export interface ToastOptions {
    /**
     * Milliseconds before the toast closes by itself. Defaults to 5000, and to no timeout for
     * toasts with an action, which users must have time to reach.
     */
    timeout?: number | null;
    onClose?: () => void;
}

export interface Toasts {
    /** Shows a toast. Returns its key. */
    show(content: ToastContent, options?: ToastOptions): string;
    /** Closes a toast by key. */
    close(key: string): void;
}

const TONE_ICONS: Record<ToastTone, IconComponent | null> = {
    neutral: null,
    success: CircleCheck,
    danger: CircleAlert,
    warning: TriangleAlert,
    info: Info,
};

const ToastContext = createContext<Toasts | null>(null);

/** Shows toasts in the closest `PanneauRoot`. */
export function useToast(): Toasts {
    const toasts = use(ToastContext);
    if (toasts === null) {
        throw new Error('useToast() must be used inside <PanneauRoot>.');
    }
    return toasts;
}

export interface ToastProviderProps {
    children?: ReactNode;
    /** Class names that give the region its tokens, since it renders in the body. */
    regionClassName?: string;
    regionProps?: Record<`data-${string}`, string | undefined>;
}

/** Holds the toasts of a `PanneauRoot` and renders them in an accessible region. */
export function ToastProvider({ children, regionClassName, regionProps }: ToastProviderProps) {
    const intl = usePanneauIntl();
    const [queue] = useState(() => new AriaToastQueue<ToastContent>({ maxVisibleToasts: 5 }));
    const [toasts] = useState<Toasts>(() => ({
        show(content, { timeout, onClose } = {}) {
            const delay = timeout === undefined ? (content.action ? null : 5000) : timeout;
            return queue.add(content, {
                ...(delay !== null ? { timeout: delay } : {}),
                ...(onClose !== undefined ? { onClose } : {}),
            });
        },
        close(key) {
            queue.close(key);
        },
    }));
    return (
        <ToastContext value={toasts}>
            {children}
            <AriaToastRegion
                queue={queue}
                aria-label={intl.formatMessage(messages.notifications)}
                className={cx(regionClassName, styles.region)}
                {...regionProps}
            >
                {({ toast }) => {
                    const tone = toast.content.tone ?? 'neutral';
                    const icon = TONE_ICONS[tone];
                    const { action } = toast.content;
                    return (
                        <AriaToast toast={toast} className={cx(styles.toast, styles[tone])}>
                            {icon !== null ? (
                                <Icon icon={icon} size="lg" className={styles.icon} />
                            ) : null}
                            <AriaToastContent className={styles.content}>
                                <Text slot="title" className={styles.title}>
                                    {toast.content.title}
                                </Text>
                                {toast.content.description !== undefined ? (
                                    <Text slot="description" className={styles.description}>
                                        {toast.content.description}
                                    </Text>
                                ) : null}
                            </AriaToastContent>
                            <div className={styles.actions}>
                                {action !== undefined ? (
                                    <Button
                                        size="sm"
                                        onPress={() => {
                                            action.onAction();
                                            queue.close(toast.key);
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                ) : null}
                                <IconButton
                                    slot="close"
                                    icon={X}
                                    size="sm"
                                    label={intl.formatMessage(messages.close)}
                                    showTooltip={false}
                                />
                            </div>
                        </AriaToast>
                    );
                }}
            </AriaToastRegion>
        </ToastContext>
    );
}
