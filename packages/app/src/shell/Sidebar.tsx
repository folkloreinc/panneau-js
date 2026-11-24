import {
    ChevronRight,
    ChevronsUpDown,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    UserRound,
    X,
} from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Button, Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Icon,
    IconButton,
    Tooltip,
    useFormatShortcut,
    usePanneauIntl,
    usePreference,
} from '@panneau/ui';

import { cx } from '../cx';
import {
    type NavEntry,
    type NavLink,
    getNavigation,
    getProfilePath,
    isCurrent,
} from '../navigation';
import { getMenuRoute } from '../parents';
import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import { ContextPicker, ContextPickerButton } from './ContextPicker';
import styles from './Sidebar.module.css';
import { type ColorSchemePreference, UserAvatar, UserMenu, getUserMenuLabel } from './UserMenu';
import type { DensityChoice } from './density';
import { SiteLogo } from './frame';
import { GO_TO_KEYS, SIDEBAR_KEYS } from './keys';
import { getHomeLink, getLinkIcon } from './links';

/** A group of the sidebar, opened or closed by the user (decision 0079). */
const GROUP_STATES = ['open', 'closed'] as const;

/** A list of links of the sidebar: a group, or the links between separators. */
interface Section {
    key: string;
    label?: string | undefined;
    links: NavLink[];
    collapsible?: boolean;
    collapsed?: boolean;
}

interface NavSectionProps {
    section: Section;
    /** The sidebar is a rail of icons: no titles, every link shown. */
    rail: boolean;
    /** One of its links is the current page. */
    holdsCurrent: boolean;
    children: ReactNode;
}

/**
 * A section of the sidebar, under its title. A collapsible group (decision 0079) has a button for
 * its title, and the browser remembers whether the user opened or closed it. Without that choice,
 * it starts as `collapsed` says, but open when it holds the current page, and stays open once the
 * user went to one of its pages.
 */
function NavSection({ section, rail, holdsCurrent, children }: NavSectionProps) {
    const { label, collapsible = false, collapsed = false } = section;
    const [choice, setChoice] = usePreference(
        collapsible && label !== undefined ? `nav-group:${label}` : null,
        GROUP_STATES,
    );
    const [visited, setVisited] = useState(holdsCurrent);
    if (holdsCurrent && !visited) {
        setVisited(true);
    }
    const listId = useId();
    const open =
        !collapsible || rail || (choice !== null ? choice === 'open' : !collapsed || visited);

    return (
        <div className={styles.section}>
            {label !== undefined ? (
                collapsible && !rail ? (
                    <Button
                        className={cx(styles.sectionLabel, styles.sectionToggle)}
                        aria-expanded={open}
                        aria-controls={listId}
                        onPress={() => setChoice(open ? 'closed' : 'open')}
                    >
                        <span className={styles.label}>{label}</span>
                        <Icon icon={ChevronRight} size="sm" className={styles.sectionChevron} />
                    </Button>
                ) : (
                    <span className={styles.sectionLabel} aria-hidden={rail}>
                        {label}
                    </span>
                )
            ) : null}
            <ul id={listId} className={styles.list} hidden={!open}>
                {children}
            </ul>
        </div>
    );
}

export interface SidebarProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
    /** Only icons, with the labels in tooltips. */
    collapsed?: boolean;
    /** Collapses or expands the sidebar. Without it, the sidebar has no such button. */
    onToggle?: () => void;
    /** Closes the sidebar, when it is a drawer on a small screen. */
    onClose?: () => void;
    /** Called after a link is followed, to close a drawer. */
    onNavigate?: () => void;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** The user's density, and how to keep it: without it, no choice (decision 0104). */
    density?: DensityChoice | undefined;
    onDensityChange?: ((density: DensityChoice) => void) | undefined;
    /** Logs the user out. Without it, the user's menu has no "Log out". */
    onLogOut?: () => void;
    /**
     * Switches the interface to a locale of `interfaceLocales` (decision 0083). Without it, or
     * with fewer than two, the user's menu has no "Language".
     */
    onLocaleChange?: ((locale: string) => void) | undefined;
    /** Opens the "Go to…" palette. Without it, the sidebar has no such button. */
    onGoTo?: () => void;
    className?: string;
}

/**
 * The main navigation, as a column: the site, the current context (decision 0045), the links of
 * the `main` menu of the definition, the notification area of queued action runs, and the user,
 * whose menu has their profile, the appearance, the language and the logout (decision 0086).
 * Collapsed, it is a rail of icons, as in the sidebars of recent browsers. It renders inside an
 * `ActionRunnerProvider`.
 */
export function Sidebar({
    definition,
    basePath,
    route,
    collapsed = false,
    onToggle,
    onClose,
    onNavigate,
    colorScheme,
    onColorSchemeChange,
    density,
    onDensityChange,
    onLogOut,
    onLocaleChange,
    onGoTo,
    className,
}: SidebarProps) {
    const intl = usePanneauIntl();
    const formatShortcut = useFormatShortcut();
    const home = getHomeLink(intl.formatMessage(appMessages.home), basePath);
    const entries = getNavigation(definition, basePath);
    // What the links show as current: the route, or its nearest parent in them (decision 0093)
    const menuRoute = getMenuRoute(definition, [home, ...entries], route);
    // Groups and the links between separators each get their own list.
    const sections: Section[] = [{ key: 'home', links: [home] }];
    entries.forEach((entry: NavEntry) => {
        const last = sections.at(-1);
        if (entry.type === 'link') {
            if (last === undefined || last.label !== undefined || last.key === 'home') {
                sections.push({ key: entry.key, links: [entry] });
            } else {
                last.links.push(entry);
            }
        } else if (entry.type === 'group') {
            sections.push({
                key: entry.key,
                label: entry.label,
                links: entry.children,
                collapsible: entry.collapsible === true,
                collapsed: entry.collapsed === true,
            });
        } else {
            sections.push({ key: `separator-${entry.key}`, links: [] });
        }
    });

    const renderLink = (link: NavLink) => {
        const current = isCurrent(link.target, menuRoute);
        const external = link.target.kind === 'url' && link.target.external;
        const element = (
            <Link
                href={link.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                aria-current={current ? 'page' : undefined}
                aria-label={collapsed ? link.label : undefined}
                className={cx(styles.link, link.emphasis === true && styles.emphasis)}
                onPress={onNavigate}
            >
                <Icon icon={getLinkIcon(link)} size="md" className={styles.linkIcon} />
                <span className={styles.label}>{link.label}</span>
            </Link>
        );
        return (
            <li key={link.key}>
                {collapsed ? (
                    <Tooltip content={link.label} placement="end" delay={300}>
                        {element}
                    </Tooltip>
                ) : (
                    element
                )}
            </li>
        );
    };

    const user = definition.user ?? null;
    const profilePath = getProfilePath(definition, basePath);
    const currentPath = route.name !== 'not-found' ? routePath(route, basePath) : null;
    const userLabel = getUserMenuLabel(definition, intl);
    const avatar =
        user !== null ? (
            <UserAvatar user={user} />
        ) : (
            <span className={styles.avatar} aria-hidden="true">
                <Icon icon={UserRound} size="sm" />
            </span>
        );
    const userButton = (
        <Button
            aria-label={userLabel}
            // The user's menu is a popover: a menu, then the appearance and the density
            aria-haspopup="dialog"
            className={styles.user}
            data-current={(profilePath !== null && currentPath === profilePath) || undefined}
        >
            {avatar}
            <span className={cx(styles.label, styles.userText)}>
                <span className={styles.userName}>
                    {user?.name ?? intl.formatMessage(appMessages.account)}
                </span>
                {user?.email !== undefined ? (
                    <span className={styles.userEmail}>{user.email}</span>
                ) : null}
            </span>
            <Icon icon={ChevronsUpDown} size="sm" className={styles.userChevron} />
        </Button>
    );
    const goToKeys = formatShortcut(GO_TO_KEYS).keys;

    return (
        <div className={cx(styles.sidebar, collapsed && styles.collapsed, className)}>
            <div className={styles.top}>
                <Link
                    href={routePath({ name: 'home' }, basePath)}
                    className={styles.brand}
                    aria-label={collapsed ? definition.name : undefined}
                    onPress={onNavigate}
                >
                    <SiteLogo definition={definition} />
                    <span className={styles.label}>{definition.name}</span>
                </Link>
                {onToggle !== undefined ? (
                    <IconButton
                        icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                        label={intl.formatMessage(
                            collapsed ? appMessages.expandSidebar : appMessages.collapseSidebar,
                        )}
                        aria-expanded={!collapsed}
                        shortcut={SIDEBAR_KEYS}
                        size="sm"
                        className={styles.toggle}
                        onPress={onToggle}
                    />
                ) : null}
                {onClose !== undefined ? (
                    <IconButton
                        icon={X}
                        label={intl.formatMessage(appMessages.closeMenu)}
                        size="sm"
                        className={styles.toggle}
                        onPress={onClose}
                    />
                ) : null}
            </div>
            {collapsed ? <ContextPickerButton /> : <ContextPicker />}
            {onGoTo !== undefined ? (
                collapsed ? (
                    <IconButton
                        icon={Search}
                        label={intl.formatMessage(appMessages.goTo)}
                        aria-haspopup="dialog"
                        shortcut={GO_TO_KEYS}
                        size="sm"
                        className={styles.goToIcon}
                        onPress={onGoTo}
                    />
                ) : (
                    // Its keys in its tooltip, as every hint of a shortcut (#487)
                    <Tooltip content={intl.formatMessage(appMessages.goTo)} shortcut={GO_TO_KEYS}>
                        <Button
                            aria-haspopup="dialog"
                            // React Aria leaves `aria-keyshortcuts` out of the button's attributes
                            render={(props) => <button {...props} aria-keyshortcuts={goToKeys} />}
                            className={styles.goTo}
                            onPress={onGoTo}
                        >
                            <Icon icon={Search} size="sm" className={styles.goToSearch} />
                            <span className={styles.goToLabel}>
                                {intl.formatMessage(appMessages.goTo)}
                            </span>
                        </Button>
                    </Tooltip>
                )
            ) : null}
            <nav aria-label={intl.formatMessage(appMessages.navigation)} className={styles.nav}>
                {sections.map((section) =>
                    section.links.length === 0 ? (
                        <hr key={section.key} className={styles.separator} />
                    ) : (
                        <NavSection
                            key={section.key}
                            section={section}
                            rail={collapsed}
                            holdsCurrent={section.links.some((link) =>
                                isCurrent(link.target, menuRoute),
                            )}
                        >
                            {section.links.map(renderLink)}
                        </NavSection>
                    ),
                )}
            </nav>
            <ActionRunsButton appearance={collapsed ? 'icon' : 'row'} />
            <div className={styles.footer}>
                <UserMenu
                    definition={definition}
                    basePath={basePath}
                    colorScheme={colorScheme}
                    onColorSchemeChange={onColorSchemeChange}
                    density={density}
                    onDensityChange={onDensityChange}
                    onLogOut={onLogOut}
                    onLocaleChange={onLocaleChange}
                    onNavigate={onNavigate}
                    placement="top start"
                >
                    {collapsed ? (
                        <Tooltip content={userLabel} placement="end" delay={300}>
                            {userButton}
                        </Tooltip>
                    ) : (
                        userButton
                    )}
                </UserMenu>
            </div>
        </div>
    );
}
