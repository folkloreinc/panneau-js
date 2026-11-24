import { Ellipsis, Search, UserRound } from 'lucide-react';
import { Button, Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Icon,
    Menu,
    MenuItem,
    MenuSection,
    MenuTrigger,
    Tooltip,
    useFormatShortcut,
    usePanneauIntl,
} from '@panneau/ui';

import { cx } from '../cx';
import {
    type NavEntry,
    type NavGroup,
    type NavLink,
    getNavigation,
    getProfilePath,
    isCurrent,
} from '../navigation';
import { getMenuRoute } from '../parents';
import { type AppRoute, routePath } from '../routes';
import { ActionRunsButton } from './ActionRunsButton';
import styles from './Dock.module.css';
import { type ColorSchemePreference, UserAvatar, UserMenu, getUserMenuLabel } from './UserMenu';
import type { DensityChoice } from './density';
import { GO_TO_KEYS } from './keys';
import { getGroupIcon, getHomeLink, getLinkIcon } from './links';

/** The entries of the menu that a phone shows in the dock, before "More". */
export const PHONE_ENTRIES = 3;

export interface DockProps {
    definition: Definition;
    basePath: string;
    route: AppRoute;
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
    /** Opens the "Go to…" palette. Without it, the dock has no such button. */
    onGoTo?: () => void;
    className?: string;
}

function linkProps(link: NavLink) {
    const external = link.target.kind === 'url' && link.target.external;
    return {
        href: link.href,
        target: external ? '_blank' : undefined,
        rel: external ? 'noopener noreferrer' : undefined,
    };
}

function LinkItem({ link, route }: { link: NavLink; route: AppRoute }) {
    return (
        <Link
            {...linkProps(link)}
            aria-current={isCurrent(link.target, route) ? 'page' : undefined}
            className={cx(styles.item, link.emphasis === true && styles.emphasis)}
        >
            <Icon icon={getLinkIcon(link)} size="md" />
            <span className={styles.label}>{link.label}</span>
        </Link>
    );
}

function linkItems(links: NavLink[]) {
    return links.map((link) => (
        <MenuItem
            key={link.key}
            id={link.key}
            {...linkProps(link)}
            icon={getLinkIcon(link)}
            textValue={link.label}
            className={cx(link.emphasis === true && styles.emphasis)}
        >
            {link.label}
        </MenuItem>
    ));
}

/** A group of the menu: a button that opens a menu of its links, upwards. */
function GroupItem({ group, route }: { group: NavGroup & { label: string }; route: AppRoute }) {
    const current = group.children.some((link) => isCurrent(link.target, route));
    return (
        <MenuTrigger>
            <Button className={styles.item} data-current={current || undefined}>
                <Icon icon={getGroupIcon(group)} size="md" />
                <span className={styles.label}>{group.label}</span>
            </Button>
            <Menu placement="top start" aria-label={group.label}>
                {linkItems(group.children)}
            </Menu>
        </MenuTrigger>
    );
}

/**
 * The navigation of the shell at the bottom of the window (decision 0076): the entries of the
 * `main` menu, each group as a menu that opens upwards, then "Go to…", the queued action runs and
 * the user's menu, the same as the sidebar's (decision 0086). From the `lg` width of
 * the root, a raised pill in the middle; below it, a bar of tabs, with the first entries and "More"
 * for the others, and "Go to…" and the action runs left to the bar at the top. It renders inside an
 * `ActionRunnerProvider`.
 */
export function Dock({
    definition,
    basePath,
    route,
    colorScheme,
    onColorSchemeChange,
    density,
    onDensityChange,
    onLogOut,
    onLocaleChange,
    onGoTo,
    className,
}: DockProps) {
    const intl = usePanneauIntl();
    const formatShortcut = useFormatShortcut();
    const home = getHomeLink(intl.formatMessage(appMessages.home), basePath);
    // A group without a label is its links: a button needs one.
    const entries: NavEntry[] = [
        home,
        ...getNavigation(definition, basePath).flatMap((entry) =>
            entry.type === 'group' && entry.label === undefined ? entry.children : [entry],
        ),
    ];
    // What the entries show as current: the route, or its nearest parent in them (decision 0093)
    const menuRoute = getMenuRoute(definition, entries, route);
    // On a phone: the first entries, then "More" with the others, without separators.
    const onPhone = new Set<string>();
    const more: (NavLink | NavGroup)[] = [];
    for (const entry of entries) {
        if (entry.type === 'separator') {
            continue;
        }
        if (onPhone.size < PHONE_ENTRIES) {
            onPhone.add(entry.key);
        } else {
            more.push(entry);
        }
    }

    const user = definition.user ?? null;
    const profilePath = getProfilePath(definition, basePath);
    const currentPath = route.name !== 'not-found' ? routePath(route, basePath) : null;
    const goToKeys = formatShortcut(GO_TO_KEYS).keys;

    return (
        <div className={cx(styles.dock, className)}>
            <nav aria-label={intl.formatMessage(appMessages.navigation)} className={styles.nav}>
                <ul className={styles.list}>
                    {entries.map((entry) =>
                        entry.type === 'separator' ? (
                            <li
                                key={`separator-${entry.key}`}
                                aria-hidden="true"
                                className={cx(styles.separator, styles.wideOnly)}
                            />
                        ) : (
                            <li
                                key={entry.key}
                                className={cx(!onPhone.has(entry.key) && styles.wideOnly)}
                            >
                                {entry.type === 'link' ? (
                                    <LinkItem link={entry} route={menuRoute} />
                                ) : (
                                    <GroupItem
                                        group={{ ...entry, label: entry.label ?? '' }}
                                        route={menuRoute}
                                    />
                                )}
                            </li>
                        ),
                    )}
                    {more.length > 0 ? (
                        <li className={styles.phoneOnly}>
                            <MenuTrigger>
                                <Button
                                    className={styles.item}
                                    data-current={
                                        more.some((entry) =>
                                            entry.type === 'link'
                                                ? isCurrent(entry.target, menuRoute)
                                                : entry.children.some((link) =>
                                                      isCurrent(link.target, menuRoute),
                                                  ),
                                        ) || undefined
                                    }
                                >
                                    <Icon icon={Ellipsis} size="md" />
                                    <span className={styles.label}>
                                        {intl.formatMessage(appMessages.more)}
                                    </span>
                                </Button>
                                <Menu
                                    placement="top end"
                                    aria-label={intl.formatMessage(appMessages.more)}
                                >
                                    {more.map((entry) =>
                                        entry.type === 'link' ? (
                                            linkItems([entry])
                                        ) : (
                                            <MenuSection
                                                key={entry.key}
                                                id={entry.key}
                                                title={entry.label}
                                                aria-label={entry.label}
                                            >
                                                {linkItems(entry.children)}
                                            </MenuSection>
                                        ),
                                    )}
                                </Menu>
                            </MenuTrigger>
                        </li>
                    ) : null}
                </ul>
            </nav>
            <span aria-hidden="true" className={cx(styles.separator, styles.wideOnly)} />
            {onGoTo !== undefined ? (
                // Its keys in its tooltip, as every hint of a shortcut (#487)
                <Tooltip content={intl.formatMessage(appMessages.goTo)} shortcut={GO_TO_KEYS}>
                    <Button
                        aria-haspopup="dialog"
                        // React Aria leaves `aria-keyshortcuts` out of the button's attributes
                        render={(props) => <button {...props} aria-keyshortcuts={goToKeys} />}
                        className={cx(styles.item, styles.wideOnly)}
                        onPress={onGoTo}
                    >
                        <Icon icon={Search} size="md" />
                        <span className={styles.label}>{intl.formatMessage(appMessages.goTo)}</span>
                    </Button>
                </Tooltip>
            ) : null}
            <span className={styles.wideOnly}>
                <ActionRunsButton appearance="tile" placement="top end" />
            </span>
            <UserMenu
                definition={definition}
                basePath={basePath}
                colorScheme={colorScheme}
                onColorSchemeChange={onColorSchemeChange}
                density={density}
                onDensityChange={onDensityChange}
                onLogOut={onLogOut}
                onLocaleChange={onLocaleChange}
                placement="top end"
            >
                <Button
                    aria-label={getUserMenuLabel(definition, intl)}
                    className={cx(styles.item, styles.user)}
                    data-current={
                        (profilePath !== null && currentPath === profilePath) || undefined
                    }
                >
                    {user !== null ? (
                        <UserAvatar user={user} size="xs" />
                    ) : (
                        <Icon icon={UserRound} size="md" />
                    )}
                    <span className={styles.label}>
                        {user?.name ?? intl.formatMessage(appMessages.account)}
                    </span>
                </Button>
            </UserMenu>
        </div>
    );
}
