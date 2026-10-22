import { Menu, Search } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Dialog, Link, Modal, ModalOverlay } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { IconButton, useCommandShortcut, usePanneauIntl, usePortalContainer } from '@panneau/ui';

import { cx } from '../cx';
import { usePreference } from '../preferences';
import { type AppRoute, routePath } from '../routes';
import styles from './AppLayout.module.css';
import { GoTo } from './GoTo';
import { type ColorSchemePreference, Sidebar } from './Sidebar';

const CONTENT_ID = 'panneau-content';
const SIDEBAR_STATES = ['expanded', 'collapsed'] as const;

export interface AppLayoutProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    children?: ReactNode;
}

function isEditable(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    );
}

/** Whether two routes are the same list, with or without the panel of an item. */
function isSameList(a: AppRoute, b: AppRoute): boolean {
    return (
        (a.name === 'resource.index' || a.name === 'resource.show') &&
        (b.name === 'resource.index' || b.name === 'resource.show') &&
        a.resource === b.resource
    );
}

/**
 * Where focus goes when the route changes, so that screen readers announce the new page: its
 * title, or the page itself without one. Closing the panel of an item goes back to the item's
 * link in the list; opening it is left to the panel.
 */
function focusPage(main: HTMLElement, previous: AppRoute, route: AppRoute, basePath: string) {
    if (isSameList(previous, route)) {
        if (previous.name === 'resource.show' && route.name === 'resource.index') {
            const href = routePath(previous, basePath);
            const link = [...main.querySelectorAll<HTMLAnchorElement>('a[href]')].find(
                (candidate) => {
                    const value = candidate.getAttribute('href') ?? '';
                    return value === href || value.startsWith(`${href}?`);
                },
            );
            link?.focus();
        }
        return;
    }
    main.scrollTop = 0;
    window.scrollTo({ top: 0 });
    const heading = main.querySelector<HTMLElement>('h1');
    if (heading !== null && !heading.hasAttribute('tabindex')) {
        heading.tabIndex = -1;
    }
    (heading ?? main).focus({ preventScroll: true });
}

/**
 * The frame of the app. From the `lg` width of the Panneau root (64rem): the sidebar on the
 * window's background and the page on a raised panel, like the vertical tabs of recent browsers.
 * The sidebar collapses to a rail of icons (with its button, or Ctrl+\ / ⌘+\), and the browser
 * remembers it. On a smaller screen: a bar at the top, whose button opens the sidebar as a drawer.
 * When the route changes, focus moves to the title of the new page, and the page scrolls to the
 * top.
 */
export function AppLayout({
    definition,
    basePath,
    route,
    colorScheme,
    onColorSchemeChange,
    children,
}: AppLayoutProps) {
    const intl = usePanneauIntl();
    const portalContainer = usePortalContainer();
    const [sidebar, setSidebar] = usePreference('sidebar', SIDEBAR_STATES);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [goToOpen, setGoToOpen] = useState(false);
    useCommandShortcut(() => setGoToOpen((open) => !open), { isOpen: goToOpen });
    const openGoTo = () => {
        setDrawerOpen(false);
        setGoToOpen(true);
    };
    const collapsed = sidebar === 'collapsed';
    const toggle = () => setSidebar(collapsed ? 'expanded' : 'collapsed');

    const main = useRef<HTMLElement>(null);
    const previousRoute = useRef<AppRoute | null>(null);
    const routeKey = JSON.stringify(route);
    useEffect(() => {
        const next = JSON.parse(routeKey) as AppRoute;
        const previous = previousRoute.current;
        previousRoute.current = next;
        // The first page keeps the focus where the browser put it
        if (previous === null || main.current === null) {
            return undefined;
        }
        const element = main.current;
        // After the page renders, and after a dialog that navigated gave focus back
        const frame = window.requestAnimationFrame(() =>
            focusPage(element, previous, next, basePath),
        );
        return () => window.cancelAnimationFrame(frame);
    }, [routeKey, basePath]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === '\\' &&
                (event.metaKey || event.ctrlKey) &&
                !event.altKey &&
                !isEditable(event.target)
            ) {
                event.preventDefault();
                toggle();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const sidebarProps = {
        definition,
        basePath,
        route,
        colorScheme,
        onColorSchemeChange,
        onGoTo: openGoTo,
    };

    return (
        <div className={cx(styles.layout, collapsed && styles.collapsed)}>
            <a href={`#${CONTENT_ID}`} className={styles.skipLink}>
                {intl.formatMessage(appMessages.skipToContent)}
            </a>
            <header className={styles.topBar}>
                <IconButton
                    icon={Menu}
                    label={intl.formatMessage(appMessages.openMenu)}
                    aria-expanded={drawerOpen}
                    onPress={() => setDrawerOpen(true)}
                />
                <Link href={routePath({ name: 'home' }, basePath)} className={styles.topBarName}>
                    {definition.name}
                </Link>
                <IconButton
                    icon={Search}
                    label={intl.formatMessage(appMessages.goTo)}
                    aria-haspopup="dialog"
                    className={styles.topBarSearch}
                    onPress={openGoTo}
                />
            </header>
            <aside className={styles.sidebar}>
                <Sidebar {...sidebarProps} collapsed={collapsed} onToggle={toggle} />
            </aside>
            <main ref={main} id={CONTENT_ID} tabIndex={-1} className={styles.main}>
                <div className={styles.panel}>{children}</div>
            </main>
            <GoTo
                definition={definition}
                basePath={basePath}
                isOpen={goToOpen}
                onOpenChange={setGoToOpen}
                sidebarCollapsed={collapsed}
                onToggleSidebar={toggle}
                colorScheme={colorScheme}
                onColorSchemeChange={onColorSchemeChange}
            />
            {portalContainer !== null ? (
                <ModalOverlay
                    isOpen={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    isDismissable
                    className={styles.backdrop}
                    UNSTABLE_portalContainer={portalContainer}
                >
                    <Modal className={styles.drawer}>
                        <Dialog
                            aria-label={intl.formatMessage(appMessages.navigation)}
                            className={styles.drawerDialog}
                        >
                            <Sidebar
                                {...sidebarProps}
                                onClose={() => setDrawerOpen(false)}
                                onNavigate={() => setDrawerOpen(false)}
                            />
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            ) : null}
        </div>
    );
}
