import { ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import {
    Fragment,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
    createContext,
    use,
    useId,
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    Button as AriaButton,
    Disclosure as AriaDisclosure,
    Heading as AriaHeading,
    DisclosurePanel,
} from 'react-aria-components';

import { Heading, type HeadingLevel } from '../heading/Heading';
import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { cx } from '../utils/cx';
import { usePreference } from '../utils/preference';
import styles from './Aside.module.css';

const SIZES = ['normal', 'wide'] as const;
const PANEL_STATES = ['expanded', 'collapsed'] as const;

/** The key under which the panels of an aside remember whether they are collapsed. */
const StorageKeyContext = createContext<string | null>(null);

/**
 * Whether the aside is before the content of a narrow layout (`narrow="before"`), where it is a
 * disclosure, collapsed by default.
 */
const BeforeContext = createContext(false);

/** The width from which the aside goes beside the content, as in `Aside.module.css`. */
const BESIDE_WIDTH_REM = 56;

/**
 * Whether a layout is wide enough to put its aside beside its content, measured as its container
 * query does: `null` until it is measured, and while it has no size (not rendered, or in jsdom).
 */
function useIsBeside(isActive: boolean) {
    const ref = useRef<HTMLDivElement>(null);
    const [isBeside, setIsBeside] = useState<boolean | null>(null);
    useLayoutEffect(() => {
        const element = ref.current;
        if (!isActive || element === null || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const measure = () => {
            const width = element.clientWidth;
            if (width === 0) {
                return;
            }
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            setIsBeside(width >= BESIDE_WIDTH_REM * rem);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [isActive]);
    return [ref, isBeside] as const;
}

export interface AsideLayoutProps {
    /** The main content: a list, a form. */
    children: ReactNode;
    /** The aside next to it, or nothing. The content keeps its place when it opens or closes. */
    aside?: ReactNode;
    /**
     * Where the aside goes when the layout is too narrow to put it beside the content (56rem):
     * `below` the content; `before` it, in the order of the page too, as a disclosure collapsed by
     * default, without the card of the aside, for what says what the content is (the sidebar of a
     * form, decision 0075); or `overlay`, over the content on its right, the whole width on a
     * phone, for an aside that opens on demand and closes. Defaults to `below`.
     */
    narrow?: 'below' | 'before' | 'overlay';
    /**
     * Where the aside goes when the layout is wide enough: `beside` the content from 56rem, or
     * `overlay`, over the content on its right at every width, so that the content never reflows
     * when the aside opens or closes, as the item panel of a list (decision 0099). `narrow` then
     * changes nothing. Defaults to `beside`.
     */
    placement?: 'beside' | 'overlay';
    /**
     * Called when the aside goes before the content (`narrow="before"`) or leaves that place: the
     * page can follow the order shown, such as a form for the order of its errors.
     */
    onBeforeChange?: (isBefore: boolean) => void;
    className?: string;
    mainClassName?: string;
}

/**
 * Places an aside next to the main content of a page or a form (decision 0074): beside it from
 * 56rem of the layout, below it, before it or over it otherwise. Beside the content, the aside
 * stays in view as the page scrolls. With `placement="overlay"`, it is over the content at every
 * width (decision 0099).
 *
 * Before the content, the aside moves in the page, not only on the screen: the order of reading
 * and of the keyboard is the one shown. The layout measures its width for that; until it has one,
 * the aside is after the content.
 */
export function AsideLayout({
    children,
    aside,
    narrow = 'below',
    placement = 'beside',
    onBeforeChange,
    className,
    mainClassName,
}: AsideLayoutProps) {
    const isOverlay = placement === 'overlay';
    const hasAside = aside !== undefined && aside !== null && aside !== false;
    const [ref, isBeside] = useIsBeside(hasAside && !isOverlay && narrow === 'before');
    const isBefore = hasAside && !isOverlay && narrow === 'before' && isBeside === false;
    const reportBefore = useEffectEvent((value: boolean) => onBeforeChange?.(value));
    useEffect(() => reportBefore(isBefore), [isBefore]);
    // Keyed, the aside and the content move rather than mount again when the aside changes place:
    // fields keep their state.
    const placed = <Fragment key="aside">{aside}</Fragment>;
    return (
        <div ref={ref} className={cx('panneau-aside-layout', styles.layout, className)}>
            <div
                className={cx(
                    styles.grid,
                    hasAside && !isOverlay && styles.withAside,
                    (isOverlay || narrow === 'overlay') && styles.overlay,
                    isOverlay && styles.alwaysOverlay,
                )}
            >
                <BeforeContext value={isBefore}>
                    {[
                        isBefore ? placed : null,
                        <div key="main" className={cx(styles.main, mainClassName)}>
                            {children}
                        </div>,
                        isBefore ? null : placed,
                    ]}
                </BeforeContext>
            </div>
        </div>
    );
}

export interface AsideProps {
    /** Accessible name of the aside, a region of the page. */
    label: string;
    /** Title in its header. */
    title?: ReactNode;
    /** Heading level of the title. Defaults to 2. */
    headingLevel?: HeadingLevel;
    /** Its title loads: a skeleton of a line in its place (decision 0034). */
    isLoading?: boolean;
    /** Under the header: the actions of what the aside shows. */
    toolbar?: ReactNode;
    /** Its panels (`AsidePanel`), or any content. */
    children?: ReactNode;
    /** Shows a button that widens it, for previews. */
    isWidenable?: boolean;
    /** Shows a close button, also run by Escape. */
    onClose?: () => void;
    /**
     * The key under which the browser remembers its width and its collapsed panels:
     * `panneau:<key>-size` and `panneau:<key>-panel-<id>`. Without one, they last as long as the
     * page.
     */
    storageKey?: string;
    /**
     * Before the content of a narrow layout (`narrow="before"` of `AsideLayout`), where the aside
     * is a disclosure: what its button shows of it while it is collapsed, such as the titles of its
     * panels. Its title or its label otherwise.
     */
    summary?: ReactNode;
    /** After the summary, on its button: a count of errors. */
    summaryEnd?: ReactNode;
    /**
     * Before the content of a narrow layout, whether its disclosure is expanded, for an aside that
     * something else opens, such as a form to show an error. Collapsed by default.
     */
    isExpanded?: boolean;
    onExpandedChange?: (isExpanded: boolean) => void;
    /** `-1` makes it focusable, to move the focus to it when it shows something else. */
    tabIndex?: number;
    ref?: Ref<HTMLElement>;
    className?: string;
    bodyClassName?: string;
}

/**
 * The column next to the main content of a page or a form, made of panels (decision 0074): the
 * details of an item next to its list, the sidebar of a form. Placed by `AsideLayout`.
 */
export function Aside({
    label,
    title,
    headingLevel = 2,
    isLoading = false,
    toolbar,
    children,
    isWidenable = false,
    onClose,
    storageKey,
    summary,
    summaryEnd,
    isExpanded,
    onExpandedChange,
    tabIndex,
    ref,
    className,
    bodyClassName,
}: AsideProps) {
    const intl = usePanneauIntl();
    const isBefore = use(BeforeContext);
    const bodyId = useId();
    const [ownExpanded, setOwnExpanded] = useState(false);
    const expanded = isExpanded ?? ownExpanded;
    const setExpanded = (next: boolean) => {
        setOwnExpanded(next);
        onExpandedChange?.(next);
    };
    const [size, setSize] = usePreference(
        storageKey !== undefined ? `${storageKey}-size` : null,
        SIZES,
    );
    const wide = isWidenable && size === 'wide';
    const hasTitle = title !== undefined && title !== null;
    const hasHeader = hasTitle || isLoading || isWidenable || onClose !== undefined;

    const onKeyDown = (event: KeyboardEvent) => {
        if (onClose !== undefined && event.key === 'Escape' && !event.defaultPrevented) {
            event.preventDefault();
            onClose();
        }
    };

    return (
        <section
            ref={ref}
            aria-label={label}
            tabIndex={tabIndex}
            className={cx('panneau-aside', styles.aside, className)}
            data-wide={wide || undefined}
            data-before={isBefore || undefined}
            onKeyDown={onKeyDown}
        >
            {isBefore ? (
                <AriaHeading level={headingLevel} className={styles.toggleHeading}>
                    <AriaButton
                        className={styles.toggle}
                        aria-expanded={expanded}
                        aria-controls={bodyId}
                        onPress={() => setExpanded(!expanded)}
                    >
                        <span className={styles.toggleText}>
                            {summary ?? (hasTitle ? title : label)}
                        </span>
                        {summaryEnd}
                        <Icon icon={ChevronRight} className={styles.chevron} />
                    </AriaButton>
                </AriaHeading>
            ) : null}
            {hasHeader && !isBefore ? (
                <header className={styles.header}>
                    {hasTitle ? (
                        <Heading level={headingLevel} className={styles.title}>
                            {title}
                        </Heading>
                    ) : isLoading ? (
                        <Skeleton className={styles.titleSkeleton} width="60%" />
                    ) : (
                        <span />
                    )}
                    <div className={styles.headerButtons}>
                        {isWidenable ? (
                            <IconButton
                                icon={wide ? Minimize2 : Maximize2}
                                label={intl.formatMessage(
                                    wide ? messages.narrowAside : messages.widenAside,
                                )}
                                size="sm"
                                className={styles.widen}
                                onPress={() => setSize(wide ? 'normal' : 'wide')}
                            />
                        ) : null}
                        {onClose !== undefined ? (
                            <IconButton
                                icon={X}
                                label={intl.formatMessage(messages.close)}
                                size="sm"
                                onPress={onClose}
                            />
                        ) : null}
                    </div>
                </header>
            ) : null}
            {toolbar !== undefined && toolbar !== null ? (
                <div className={styles.toolbar}>{toolbar}</div>
            ) : null}
            {/* The same element in every place: what it holds keeps its state */}
            <div
                id={bodyId}
                className={cx(styles.body, bodyClassName)}
                hidden={isBefore && !expanded}
            >
                <StorageKeyContext value={storageKey ?? null}>{children}</StorageKeyContext>
            </div>
        </section>
    );
}

export interface AsidePanelProps {
    /** Identifies the panel, so that the browser remembers whether it is collapsed. */
    id?: string;
    /** Its title. A panel without one is its content, and can't be collapsed. */
    title?: ReactNode;
    /** Content after the title: a count of errors. */
    titleEnd?: ReactNode;
    /** Heading level of the title. Defaults to 3. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** With a title, the user can collapse it. Defaults to true. */
    isCollapsible?: boolean;
    /** Starts collapsed, until the user expands it. */
    defaultCollapsed?: boolean;
    /**
     * Shows only beside the content: below it or over it, something else in the page does its
     * work, such as the footer of a form for its Save button.
     */
    isBesideOnly?: boolean;
    /**
     * Whether it is expanded, for a panel that something else opens, such as a form on an error.
     * The browser then remembers nothing: the owner does.
     */
    isExpanded?: boolean;
    onExpandedChange?: (isExpanded: boolean) => void;
    children?: ReactNode;
    className?: string;
}

/** A block of an aside: a title, which collapses it, and its content. Panels are separated by a line. */
export function AsidePanel({
    id,
    title,
    titleEnd,
    headingLevel = 3,
    isCollapsible = true,
    defaultCollapsed = false,
    isBesideOnly = false,
    isExpanded,
    onExpandedChange,
    children,
    className,
}: AsidePanelProps) {
    const storageKey = use(StorageKeyContext);
    const [state, setState] = usePreference(
        storageKey !== null && id !== undefined && isExpanded === undefined
            ? `${storageKey}-panel-${id}`
            : null,
        PANEL_STATES,
    );
    const hasTitle = title !== undefined && title !== null;
    if (!hasTitle) {
        return (
            <div
                className={cx('panneau-aside-panel', styles.panel, className)}
                data-beside-only={isBesideOnly || undefined}
            >
                {children}
            </div>
        );
    }
    if (!isCollapsible) {
        return (
            <section
                className={cx('panneau-aside-panel', styles.panel, className)}
                data-beside-only={isBesideOnly || undefined}
            >
                <Heading level={headingLevel} className={styles.panelTitle}>
                    {title}
                    {titleEnd !== undefined ? <> {titleEnd}</> : null}
                </Heading>
                <div className={styles.panelContent}>{children}</div>
            </section>
        );
    }
    const expanded = isExpanded ?? (state !== null ? state === 'expanded' : !defaultCollapsed);
    return (
        <AriaDisclosure
            {...(id !== undefined ? { id } : {})}
            isExpanded={expanded}
            onExpandedChange={(next) => {
                setState(next ? 'expanded' : 'collapsed');
                onExpandedChange?.(next);
            }}
            className={cx('panneau-aside-panel', styles.panel, className)}
            data-beside-only={isBesideOnly || undefined}
        >
            <AriaHeading level={headingLevel} className={styles.panelHeading}>
                <AriaButton slot="trigger" className={styles.panelTrigger}>
                    <span className={styles.panelTitle}>{title}</span>
                    {titleEnd}
                    <Icon icon={ChevronRight} className={styles.chevron} />
                </AriaButton>
            </AriaHeading>
            <DisclosurePanel className={styles.panelContent}>{children}</DisclosurePanel>
        </AriaDisclosure>
    );
}
