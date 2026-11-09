import { Menu, Search } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Dialog, Link, Modal, ModalOverlay } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    IconButton,
    useCommandShortcut,
    usePanneauIntl,
    usePortalContainer,
    usePreference,
} from '@panneau/ui';

import { cx } from '../cx';
import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import styles from './AppLayout.module.css';
import { GoTo } from './GoTo';
import { type ColorSchemePreference, Sidebar } from './Sidebar';
import { useRouteFocus } from './useRouteFocus';

export const CONTENT_ID = 'panneau-content';
export const SIDEBAR_STATES = ['expanded', 'collapsed'] as const;

export interface AppLayoutProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** Logs the user out. Without it, the sidebar has no "Log out" button. */
    onLogOut?: () => void;
    children?: ReactNode;
}

function isEditable(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    );
}

/**
 * The frame of the app. From the `lg` width of the Panneau root (64rem): the sidebar on the
 * window's background and the page on a raised panel, like the vertical tabs of recent browsers.
 * The sidebar collapses to a rail of icons (with its button, or Ctrl+\ / ⌘+\), and the browser
 * remembers it. On a smaller screen: a bar at the top, whose button opens the sidebar as a drawer.
 * Queued action runs are in the notification area of the sidebar, and of the bar on a small
 * screen. When the route changes, focus moves to the title of the new page, and the page scrolls to the
 * top.
 */
export function AppLayout({
    definition,
    basePath,
    route,
    colorScheme,
    onColorSchemeChange,
    onLogOut,
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
    useRouteFocus(main, route, basePath);

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
        onLogOut,
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
                <div className={styles.topBarEnd}>
                    <ActionRunsButton appearance="icon" placement="bottom end" />
                    <IconButton
                        icon={Search}
                        label={intl.formatMessage(appMessages.goTo)}
                        aria-haspopup="dialog"
                        onPress={openGoTo}
                    />
                </div>
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
