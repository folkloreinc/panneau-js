import {
    ChevronDown,
    Languages,
    LogOut,
    Monitor,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Sun,
    X,
} from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Button, Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Icon,
    IconButton,
    type IconComponent,
    Menu,
    MenuItem,
    MenuTrigger,
    Tooltip,
    isApplePlatform,
    usePanneauIntl,
    usePreference,
} from '@panneau/ui';

import { cx } from '../cx';
import { getInterfaceLocales } from '../interfaceLocales';
import {
    type NavEntry,
    type NavLink,
    getNavigation,
    getProfilePath,
    isCurrent,
} from '../navigation';
import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import { ContextPicker, ContextPickerButton } from './ContextPicker';
import styles from './Sidebar.module.css';
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
                        <Icon icon={ChevronDown} size="sm" className={styles.sectionChevron} />
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

/** The color schemes the user can pick, in the order of the button. */
export const COLOR_SCHEMES = ['light', 'dark', 'auto'] as const;
export type ColorSchemePreference = (typeof COLOR_SCHEMES)[number];

/** The icon of each color scheme. */
export const SCHEME_ICONS: Record<ColorSchemePreference, IconComponent> = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
};

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
    /** Logs the user out. Without it, the sidebar has no "Log out" button. */
    onLogOut?: () => void;
    /**
     * Switches the interface to a locale of `interfaceLocales` (decision 0083). Without it, or
     * with fewer than two, the sidebar has no language button.
     */
    onLocaleChange?: ((locale: string) => void) | undefined;
    /** Opens the "Go to…" palette. Without it, the sidebar has no such button. */
    onGoTo?: () => void;
    className?: string;
}

/**
 * The main navigation, as a column: the site, the current context (decision 0045), the links of
 * the `main` menu of the definition, the notification area of queued action runs, and the user,
 * with the buttons of the appearance, of the language (decision 0083) and of the logout. Collapsed,
 * it is a rail of icons, as in the sidebars of recent browsers. It renders inside an
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
    onLogOut,
    onLocaleChange,
    onGoTo,
    className,
}: SidebarProps) {
    const intl = usePanneauIntl();
    const home = getHomeLink(intl.formatMessage(appMessages.home), basePath);
    const entries = getNavigation(definition, basePath);
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
        const current = isCurrent(link.target, route);
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
    // The user's profile, when the definition has the resource of users
    const profilePath = getProfilePath(definition, basePath);
    const currentPath = route.name !== 'not-found' ? routePath(route, basePath) : null;
    const userContent =
        user !== null ? (
            <>
                {user.avatarUrl !== undefined ? (
                    <img src={user.avatarUrl} alt="" className={styles.avatar} />
                ) : (
                    <span className={styles.avatar} aria-hidden="true">
                        {user.name.charAt(0).toLocaleUpperCase(definition.locale)}
                    </span>
                )}
                <span className={cx(styles.label, styles.userText)}>
                    <span className={styles.userName}>{user.name}</span>
                    {user.email !== undefined ? (
                        <span className={styles.userEmail}>{user.email}</span>
                    ) : null}
                </span>
            </>
        ) : null;
    const apple = isApplePlatform();
    const shortcut = apple ? '⌘K' : 'Ctrl+K';
    const keyShortcuts = apple ? 'Meta+K' : 'Control+K';
    const locales = onLocaleChange !== undefined ? getInterfaceLocales(definition) : [];
    const language =
        locales.find(({ locale }) => locale === definition.locale)?.label ?? definition.locale;
    const nextScheme =
        COLOR_SCHEMES[(COLOR_SCHEMES.indexOf(colorScheme) + 1) % COLOR_SCHEMES.length] ?? 'light';

    return (
        <div className={cx(styles.sidebar, collapsed && styles.collapsed, className)}>
            <div className={styles.top}>
                <Link
                    href={routePath({ name: 'home' }, basePath)}
                    className={styles.brand}
                    aria-label={collapsed ? definition.name : undefined}
                    onPress={onNavigate}
                >
                    <span className={styles.logo} aria-hidden="true">
                        {definition.name.charAt(0).toLocaleUpperCase(definition.locale)}
                    </span>
                    <span className={styles.label}>{definition.name}</span>
                </Link>
                {onToggle !== undefined ? (
                    <IconButton
                        icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                        label={intl.formatMessage(
                            collapsed ? appMessages.expandSidebar : appMessages.collapseSidebar,
                        )}
                        aria-expanded={!collapsed}
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
                        label={`${intl.formatMessage(appMessages.goTo)} (${shortcut})`}
                        aria-haspopup="dialog"
                        aria-keyshortcuts={keyShortcuts}
                        size="sm"
                        className={styles.goToIcon}
                        onPress={onGoTo}
                    />
                ) : (
                    <Button
                        aria-haspopup="dialog"
                        aria-keyshortcuts={keyShortcuts}
                        className={styles.goTo}
                        onPress={onGoTo}
                    >
                        <Icon icon={Search} size="sm" className={styles.goToSearch} />
                        <span className={styles.goToLabel}>
                            {intl.formatMessage(appMessages.goTo)}
                        </span>
                        <kbd className={styles.goToKey}>{shortcut}</kbd>
                    </Button>
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
                                isCurrent(link.target, route),
                            )}
                        >
                            {section.links.map(renderLink)}
                        </NavSection>
                    ),
                )}
            </nav>
            <ActionRunsButton appearance={collapsed ? 'icon' : 'row'} />
            <div className={styles.footer}>
                {user !== null ? (
                    profilePath !== null ? (
                        <Link
                            href={profilePath}
                            className={cx(styles.user, styles.userLink)}
                            aria-label={
                                collapsed
                                    ? intl.formatMessage(appMessages.profile, { name: user.name })
                                    : undefined
                            }
                            aria-current={currentPath === profilePath ? 'page' : undefined}
                            onPress={onNavigate}
                        >
                            {userContent}
                        </Link>
                    ) : (
                        <div className={styles.user}>{userContent}</div>
                    )
                ) : null}
                <IconButton
                    icon={SCHEME_ICONS[colorScheme]}
                    label={intl.formatMessage(appMessages.colorScheme, { scheme: colorScheme })}
                    size="sm"
                    onPress={() => onColorSchemeChange(nextScheme)}
                />
                {locales.length > 0 ? (
                    <MenuTrigger>
                        <IconButton
                            icon={Languages}
                            label={intl.formatMessage(appMessages.languageButton, { language })}
                            size="sm"
                        />
                        <Menu
                            placement="top start"
                            aria-label={intl.formatMessage(appMessages.language)}
                            selectionMode="single"
                            disallowEmptySelection
                            selectedKeys={[definition.locale]}
                            onSelectionChange={(keys) => {
                                const [key] = keys === 'all' ? [] : [...keys];
                                if (typeof key === 'string') {
                                    onLocaleChange?.(key);
                                }
                            }}
                        >
                            {locales.map(({ locale, label }) => (
                                <MenuItem key={locale} id={locale} textValue={label}>
                                    <span lang={locale}>{label}</span>
                                </MenuItem>
                            ))}
                        </Menu>
                    </MenuTrigger>
                ) : null}
                {onLogOut !== undefined ? (
                    <IconButton
                        icon={LogOut}
                        label={intl.formatMessage(appMessages.logOut)}
                        size="sm"
                        onPress={onLogOut}
                    />
                ) : null}
            </div>
        </div>
    );
}
