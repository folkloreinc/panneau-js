import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import {
    type CSSProperties,
    type ReactNode,
    type RefObject,
    createContext,
    use,
    useEffect,
    useState,
} from 'react';
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
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Toast.module.css';

/** @deprecated Use `Tone`. */
export type ToastTone = Tone;

/**
 * What a toast says: what was done to what ("“Spring contest” saved", "3 entries archived"), and
 * the next step when there is one.
 */
export interface ToastContent {
    title: string;
    description?: string;
    /**
     * Defaults to `neutral`. A success keeps the neutral look with its icon; only `warning` and
     * `danger` color the edge.
     */
    tone?: Tone;
    /**
     * A button in the toast that leads to the result ("Open", "Show", "Download") or undoes what was
     * done ("Undo"). The toast closes when it is pressed.
     */
    action?: { label: string; onAction: () => void };
}

export interface ToastOptions {
    /**
     * A toast with the key of one already shown replaces it instead of adding another: "Saved"
     * once, however many saves. `show()` returns it.
     */
    key?: string;
    /**
     * Milliseconds before the toast closes by itself, or `null` to keep it until it is closed.
     * Defaults to what the toast holds (`getToastTimeout()`): about 5 seconds, longer for a longer
     * text, about 10 seconds with an action, and none for an error.
     */
    timeout?: number | null;
    onClose?: () => void;
}

export interface Toasts {
    /** Shows a toast. Returns its key: the one given in its options, or a new one. */
    show(content: ToastContent, options?: ToastOptions): string;
    /** Closes a toast by key. */
    close(key: string): void;
}

/** Where toasts show: `bottom` (centered, the default), `bottom-end` or `top-end`. */
export type ToastPlacement = 'bottom' | 'bottom-end' | 'top-end';

/** At most this many toasts show at once: older ones wait for a place. */
export const MAX_VISIBLE_TOASTS = 3;

/** Reading time of a toast without an action: at least 5 seconds, at most 10. */
const MIN_TIMEOUT = 5000;
/** A toast with an action stays about 10 seconds, longer for a longer text. */
const ACTION_TIMEOUT = 10000;
const MAX_TIMEOUT = 15000;
/** About 200 words a minute, plus the time to notice the toast. */
const PER_WORD = 300;
const NOTICE = 2000;

/**
 * How long a toast stays, from what it holds: about 5 seconds, longer for a longer text; about 10
 * seconds with an action, which must be reached in that time (an action to reach later belongs in
 * the page, not in a toast that stays); and `null`, no timeout, for an error the user must read.
 */
export function getToastTimeout(content: ToastContent): number | null {
    if (content.tone === 'danger') {
        return null;
    }
    const words = `${content.title} ${content.description ?? ''} ${content.action?.label ?? ''}`
        .split(/\s+/)
        .filter((word) => word !== '').length;
    const reading = NOTICE + words * PER_WORD;
    return content.action !== undefined
        ? Math.min(Math.max(ACTION_TIMEOUT, reading), MAX_TIMEOUT)
        : Math.min(Math.max(MIN_TIMEOUT, reading), ACTION_TIMEOUT);
}

const TONE_ICONS: Partial<Record<Tone, IconComponent | null>> = {
    neutral: null,
    success: CircleCheck,
    danger: CircleAlert,
    warning: TriangleAlert,
    info: Info,
};

/** Tones that color the edge of a toast: what needs a look. */
const EDGE_TONES = new Set<Tone>(['warning', 'danger']);

interface ToastContextValue extends Toasts {
    /** Sets how far toasts rise above what sticks to the bottom of the page, by who sets it. */
    setOffset(id: object, height: number | null): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Shows toasts in the closest `PanneauRoot`. */
export function useToast(): Toasts {
    const toasts = use(ToastContext);
    if (toasts === null) {
        throw new Error('useToast() must be used inside <PanneauRoot>.');
    }
    return toasts;
}

/**
 * Raises the toasts above an element that sticks to the bottom of the page, such as the footer of
 * a form, while it is mounted and `active`: its height becomes the `--panneau-toast-offset` of the
 * region. Toasts at the top ignore it.
 */
export function useToastOffset(ref: RefObject<HTMLElement | null>, active = true): void {
    const toasts = use(ToastContext);
    useEffect(() => {
        const element = ref.current;
        if (toasts === null || element === null || !active) {
            return undefined;
        }
        const id = {};
        const measure = () => toasts.setOffset(id, element.getBoundingClientRect().height);
        measure();
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
        observer?.observe(element);
        return () => {
            observer?.disconnect();
            toasts.setOffset(id, null);
        };
    }, [ref, toasts, active]);
}

export interface ToastProviderProps {
    children?: ReactNode;
    /** Where the toasts show. Defaults to `bottom`. */
    placement?: ToastPlacement;
    /** Class names that give the region its tokens, since it renders in the body. */
    regionClassName?: string;
    regionProps?: Record<`data-${string}`, string | undefined>;
}

/**
 * Holds the toasts of a `PanneauRoot` and renders them in an accessible region (decision 0062): at
 * the bottom by default, one per key, at most three, the older ones folded behind the newest until
 * the region is hovered or focused, where their timers pause.
 */
export function ToastProvider({
    children,
    placement = 'bottom',
    regionClassName,
    regionProps,
}: ToastProviderProps) {
    const intl = usePanneauIntl();
    const [queue] = useState(
        () => new AriaToastQueue<ToastContent>({ maxVisibleToasts: MAX_VISIBLE_TOASTS }),
    );
    const [offsets, setOffsets] = useState<ReadonlyMap<object, number>>(() => new Map());
    const [toasts] = useState<ToastContextValue>(() => {
        // The toast shown for each key given to show(), and back.
        const shown = new Map<string, string>();
        const keys = new Map<string, string>();
        return {
            show(content, { key, timeout, onClose } = {}) {
                const delay = timeout === undefined ? getToastTimeout(content) : timeout;
                const previous = key !== undefined ? shown.get(key) : undefined;
                if (previous !== undefined) {
                    keys.delete(previous);
                    queue.close(previous);
                }
                const added = queue.add(content, {
                    ...(delay !== null ? { timeout: delay } : {}),
                    onClose: () => {
                        const own = keys.get(added);
                        if (own !== undefined && shown.get(own) === added) {
                            shown.delete(own);
                        }
                        keys.delete(added);
                        onClose?.();
                    },
                });
                if (key === undefined) {
                    return added;
                }
                shown.set(key, added);
                keys.set(added, key);
                return key;
            },
            close(key) {
                queue.close(shown.get(key) ?? key);
            },
            setOffset(id, height) {
                setOffsets((current) => {
                    const next = new Map(current);
                    if (height === null) {
                        next.delete(id);
                    } else {
                        next.set(id, height);
                    }
                    return next;
                });
            },
        };
    });
    const offset = Math.max(0, ...offsets.values());
    return (
        <ToastContext value={toasts}>
            {children}
            <AriaToastRegion
                queue={queue}
                aria-label={intl.formatMessage(messages.notifications)}
                className={cx('panneau-toast-region', regionClassName, styles.region)}
                data-placement={placement}
                style={{ '--panneau-toast-offset': `${offset}px` } as CSSProperties}
                {...regionProps}
            >
                {({ toast }) => {
                    const tone = toast.content.tone ?? 'neutral';
                    const icon = TONE_ICONS[tone] ?? null;
                    const { action } = toast.content;
                    return (
                        <AriaToast
                            toast={toast}
                            className={cx(
                                'panneau-toast',
                                styles.toast,
                                toneClass(tone),
                                EDGE_TONES.has(tone) && styles.edge,
                            )}
                        >
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
