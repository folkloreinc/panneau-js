import { ChevronDown, Maximize2, Minimize2, X } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, type Ref, createContext, use } from 'react';
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

export interface AsideLayoutProps {
    /** The main content: a list, a form. */
    children: ReactNode;
    /** The aside next to it, or nothing. The content keeps its place when it opens or closes. */
    aside?: ReactNode;
    /**
     * Where the aside goes when the layout is too narrow to put it beside the content (56rem):
     * `below` the content, or `overlay`, over the content on its right, the whole width on a phone,
     * for an aside that opens on demand and closes. Defaults to `below`.
     */
    narrow?: 'below' | 'overlay';
    className?: string;
    mainClassName?: string;
}

/**
 * Places an aside next to the main content of a page or a form (decision 0074): beside it from
 * 56rem of the layout, below it or over it otherwise. Beside the content, the aside stays in view
 * as the page scrolls.
 */
export function AsideLayout({
    children,
    aside,
    narrow = 'below',
    className,
    mainClassName,
}: AsideLayoutProps) {
    const hasAside = aside !== undefined && aside !== null && aside !== false;
    return (
        <div className={cx('panneau-aside-layout', styles.layout, className)}>
            <div
                className={cx(
                    styles.grid,
                    hasAside && styles.withAside,
                    narrow === 'overlay' && styles.overlay,
                )}
            >
                <div className={cx(styles.main, mainClassName)}>{children}</div>
                {aside}
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
    tabIndex,
    ref,
    className,
    bodyClassName,
}: AsideProps) {
    const intl = usePanneauIntl();
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
            onKeyDown={onKeyDown}
        >
            {hasHeader ? (
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
            <div className={cx(styles.body, bodyClassName)}>
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
        return <div className={cx('panneau-aside-panel', styles.panel, className)}>{children}</div>;
    }
    if (!isCollapsible) {
        return (
            <section className={cx('panneau-aside-panel', styles.panel, className)}>
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
        >
            <AriaHeading level={headingLevel} className={styles.panelHeading}>
                <AriaButton slot="trigger" className={styles.panelTrigger}>
                    <span className={styles.panelTitle}>{title}</span>
                    {titleEnd}
                    <Icon icon={ChevronDown} className={styles.chevron} />
                </AriaButton>
            </AriaHeading>
            <DisclosurePanel className={styles.panelContent}>{children}</DisclosurePanel>
        </AriaDisclosure>
    );
}
