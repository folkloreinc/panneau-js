import { Search } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import { Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { IconButton, useCommandShortcut, usePanneauIntl, useToastOffset } from '@panneau/ui';

import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import { CONTENT_ID } from './AppLayout';
import { ContextPickerPill } from './ContextPicker';
import { Dock } from './Dock';
import styles from './DockLayout.module.css';
import { GoTo } from './GoTo';
import type { ColorSchemePreference } from './Sidebar';
import { useRouteFocus } from './useRouteFocus';

export interface DockLayoutProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** Logs the user out. Without it, the user's menu has no "Log out". */
    onLogOut?: () => void;
    children?: ReactNode;
}

/**
 * The frame of the app with the navigation in a dock, when the definition's theme sets
 * `navigation: "dock"` (decision 0076): a bar at the top with the site and the current context,
 * the page on a raised panel, and the dock at the bottom of the window, over the page as it
 * scrolls. Below the `lg` width of the root, the dock is a bar of tabs, and "Go to…" and the
 * queued action runs are in the bar at the top. What sticks to the bottom of the page, such as the
 * footer of a form, stays above the dock (`--panneau-frame-bottom`), and so do toasts. When the
 * route changes, focus moves to the title of the new page, and the page scrolls to the top.
 */
export function DockLayout({
    definition,
    basePath,
    route,
    colorScheme,
    onColorSchemeChange,
    onLogOut,
    children,
}: DockLayoutProps) {
    const intl = usePanneauIntl();
    const [goToOpen, setGoToOpen] = useState(false);
    useCommandShortcut(() => setGoToOpen((open) => !open), { isOpen: goToOpen });
    const openGoTo = () => setGoToOpen(true);

    const main = useRef<HTMLElement>(null);
    useRouteFocus(main, route, basePath);
    const dock = useRef<HTMLDivElement>(null);
    useToastOffset(dock);

    return (
        <div className={styles.layout}>
            <a href={`#${CONTENT_ID}`} className={styles.skipLink}>
                {intl.formatMessage(appMessages.skipToContent)}
            </a>
            <header className={styles.topBar}>
                <Link href={routePath({ name: 'home' }, basePath)} className={styles.brand}>
                    <span className={styles.logo} aria-hidden="true">
                        {definition.name.charAt(0).toLocaleUpperCase(definition.locale)}
                    </span>
                    <span className={styles.name}>{definition.name}</span>
                </Link>
                <ContextPickerPill className={styles.context} />
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
            <main ref={main} id={CONTENT_ID} tabIndex={-1} className={styles.main}>
                <div className={styles.panel}>{children}</div>
            </main>
            <div ref={dock} className={styles.dockArea}>
                <Dock
                    definition={definition}
                    basePath={basePath}
                    route={route}
                    colorScheme={colorScheme}
                    onColorSchemeChange={onColorSchemeChange}
                    onLogOut={onLogOut}
                    onGoTo={openGoTo}
                    className={styles.dock}
                />
            </div>
            <GoTo
                definition={definition}
                basePath={basePath}
                isOpen={goToOpen}
                onOpenChange={setGoToOpen}
                colorScheme={colorScheme}
                onColorSchemeChange={onColorSchemeChange}
            />
        </div>
    );
}
