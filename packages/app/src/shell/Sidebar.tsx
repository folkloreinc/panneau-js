import {
    ExternalLink,
    File,
    House,
    Link2,
    List,
    Monitor,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Sun,
    X,
} from 'lucide-react';
import { Button, Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Icon,
    IconButton,
    type IconComponent,
    Tooltip,
    getNamedIcon,
    isApplePlatform,
    usePanneauIntl,
} from '@panneau/ui';

import { cx } from '../cx';
import {
    type NavEntry,
    type NavLink,
    type NavTarget,
    getNavigation,
    getProfilePath,
    isCurrent,
} from '../navigation';
import { type AppRoute, routePath } from '../routes';
import styles from './Sidebar.module.css';

/** The color schemes the user can pick, in the order of the button. */
export const COLOR_SCHEMES = ['light', 'dark', 'auto'] as const;
export type ColorSchemePreference = (typeof COLOR_SCHEMES)[number];

const SCHEME_ICONS: Record<ColorSchemePreference, IconComponent> = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
};

function defaultIcon(target: NavTarget): IconComponent {
    switch (target.kind) {
        case 'home':
            return House;
        case 'resource':
            return List;
        case 'page':
            return File;
        case 'url':
            return target.external ? ExternalLink : Link2;
    }
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
    /** Opens the "Go to…" palette. Without it, the sidebar has no such button. */
    onGoTo?: () => void;
    className?: string;
}

/**
 * The main navigation, as a column: the site, the links of the `main` menu of the definition, and
 * the user. Collapsed, it is a rail of icons, as in the sidebars of recent browsers.
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
    onGoTo,
    className,
}: SidebarProps) {
    const intl = usePanneauIntl();
    const home: NavLink = {
        type: 'link',
        key: 'home',
        label: intl.formatMessage(appMessages.home),
        href: routePath({ name: 'home' }, basePath),
        icon: undefined,
        target: { kind: 'home' },
    };
    const entries = getNavigation(definition, basePath);
    // Groups and the links between separators each get their own list.
    const sections: { key: string; label?: string; links: NavLink[] }[] = [
        { key: 'home', links: [home] },
    ];
    entries.forEach((entry: NavEntry) => {
        const last = sections.at(-1);
        if (entry.type === 'link') {
            if (last === undefined || last.label !== undefined || last.key === 'home') {
                sections.push({ key: entry.key, links: [entry] });
            } else {
                last.links.push(entry);
            }
        } else if (entry.type === 'group') {
            sections.push({ key: entry.key, label: entry.label, links: entry.children });
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
                className={styles.link}
                onPress={onNavigate}
            >
                <Icon
                    icon={
                        link.icon !== undefined ? getNamedIcon(link.icon) : defaultIcon(link.target)
                    }
                    size="md"
                    className={styles.linkIcon}
                />
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
                        <div key={section.key} className={styles.section}>
                            {section.label !== undefined ? (
                                <span className={styles.sectionLabel} aria-hidden={collapsed}>
                                    {section.label}
                                </span>
                            ) : null}
                            <ul className={styles.list}>{section.links.map(renderLink)}</ul>
                        </div>
                    ),
                )}
            </nav>
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
            </div>
        </div>
    );
}
