import { Menu, Search } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import { Dialog, Link, Modal, ModalOverlay } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    IconButton,
    useCommandShortcut,
    usePanneauIntl,
    usePortalContainer,
    usePreference,
    useShortcut,
} from '@panneau/ui';

import { cx } from '../cx';
import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import styles from './AppLayout.module.css';
import { GoTo } from './GoTo';
import { Sidebar } from './Sidebar';
import type { ColorSchemePreference } from './UserMenu';
import type { DensityChoice } from './density';
import { CONTENT_ID, SkipLink } from './frame';
import { useRouteFocus } from './useRouteFocus';

export const SIDEBAR_STATES = ['expanded', 'collapsed'] as const;

export interface AppLayoutProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** The user's density, and how to keep it: without it, no choice (decision 0104). */
    density?: DensityChoice | undefined;
    onDensityChange?: ((density: DensityChoice) => void) | undefined;
    /** Logs the user out. Without it, the sidebar has no "Log out" button. */
    onLogOut?: () => void;
    /** Switches the interface to a locale of `interfaceLocales` (decision 0083). */
    onLocaleChange?: ((locale: string) => void) | undefined;
    children?: ReactNode;
}

/** The keys that collapse or expand the sidebar. */
const SIDEBAR_KEYS = 'Mod+\\';

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
    density,
    onDensityChange,
    onLogOut,
    onLocaleChange,
    children,
}: AppLayoutProps) {
    const intl = usePanneauIntl();
    const portalContainer = usePortalContainer();
    const [sidebar, setSidebar] = usePreference('sidebar', SIDEBAR_STATES);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [goToOpen, setGoToOpen] = useState(false);
    useCommandShortcut(() => setGoToOpen((open) => !open), {
        isOpen: goToOpen,
        label: intl.formatMessage(appMessages.goTo),
    });
    const openGoTo = () => {
        setDrawerOpen(false);
        setGoToOpen(true);
    };
    const collapsed = sidebar === 'collapsed';
    const toggle = () => setSidebar(collapsed ? 'expanded' : 'collapsed');

    const main = useRef<HTMLElement>(null);
    useRouteFocus(main, route, basePath);

    // Not while typing: ⌘\ is a key of some editors
    useShortcut({
        id: 'panneau.app.sidebar',
        keys: SIDEBAR_KEYS,
        label: intl.formatMessage(appMessages.toggleSidebar),
        inInputs: false,
        perform: toggle,
    });

    const sidebarProps = {
        definition,
        basePath,
        route,
        colorScheme,
        onColorSchemeChange,
        density,
        onDensityChange,
        onLogOut,
        onLocaleChange,
        onGoTo: openGoTo,
    };

    return (
        <div className={cx(styles.layout, collapsed && styles.collapsed)}>
            <SkipLink />
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
                density={density}
                onDensityChange={onDensityChange}
                onLocaleChange={onLocaleChange}
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
