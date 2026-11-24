import { ChevronRight, Keyboard, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { type ReactElement, useId, useState } from 'react';
import { Link } from 'react-aria-components';

import { appMessages, uiMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Avatar,
    type AvatarSize,
    Icon,
    type IconComponent,
    Menu,
    MenuItem,
    type MenuProps,
    MenuSection,
    MenuSeparator,
    Popover,
    PopoverTrigger,
    SegmentedControl,
    Select,
    Tooltip,
    usePanneauIntl,
    useShortcutHelp,
} from '@panneau/ui';

import { cx } from '../cx';
import { getInterfaceLocales } from '../interfaceLocales';
import { getProfilePath } from '../navigation';
import styles from './UserMenu.module.css';
import { DENSITY_CHOICES, DENSITY_ICONS, type DensityChoice } from './density';
import { SHORTCUT_HELP_KEYS } from './keys';

/** The color schemes the user can pick, in the order of the menu. */
export const COLOR_SCHEMES = ['light', 'dark', 'auto'] as const;
export type ColorSchemePreference = (typeof COLOR_SCHEMES)[number];

/** The icon of each color scheme. */
export const SCHEME_ICONS: Record<ColorSchemePreference, IconComponent> = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
};

/** The user's picture, or their initials in the color of their name. */
export function UserAvatar({
    user,
    size = 'sm',
    className,
}: {
    user: NonNullable<Definition['user']>;
    size?: AvatarSize;
    className?: string | undefined;
}) {
    return <Avatar name={user.name} src={user.avatarUrl} size={size} className={className} />;
}

/** The label of the button of the user's menu. */
export function getUserMenuLabel(
    definition: Definition,
    intl: ReturnType<typeof usePanneauIntl>,
): string {
    const user = definition.user ?? null;
    return user !== null
        ? intl.formatMessage(appMessages.userMenu, { name: user.name })
        : intl.formatMessage(appMessages.account);
}

export interface UserMenuProps {
    definition: Definition;
    basePath: string;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** The user's density (decision 0104). */
    density?: DensityChoice | undefined;
    /** Keeps the user's density. Without it, as when the definition locks it, no "Density". */
    onDensityChange?: ((density: DensityChoice) => void) | undefined;
    /** Logs the user out. Without it, the menu has no "Log out". */
    onLogOut?: (() => void) | undefined;
    /**
     * Switches the interface to a locale of `interfaceLocales` (decision 0083). Without it, or
     * with fewer than two, the menu has no "Language".
     */
    onLocaleChange?: ((locale: string) => void) | undefined;
    /** Called after the profile is opened, to close a drawer. */
    onNavigate?: (() => void) | undefined;
    placement: MenuProps<object>['placement'];
    /** The button that opens the menu, named with `getUserMenuLabel()`. */
    children: ReactElement;
}

/**
 * The user's menu (decision 0086), behind their avatar and name, top to bottom (#487): who is
 * logged in, a link to their profile when they have one; their preferences, one row each with a
 * small label: the appearance and the density (decision 0104) as rows of icons, the language as a
 * select; then a menu of the actions: the help of keyboard shortcuts (decision 0112), and "Log
 * out" alone at the end. It is a popover, a dialog: Tab goes through it in the order shown. The
 * sidebar and the dock share it.
 */
export function UserMenu({
    definition,
    basePath,
    colorScheme,
    onColorSchemeChange,
    density = 'default',
    onDensityChange,
    onLogOut,
    onLocaleChange,
    onNavigate,
    placement,
    children,
}: UserMenuProps) {
    const intl = usePanneauIntl();
    const [isOpen, setOpen] = useState(false);
    const user = definition.user ?? null;
    const label = getUserMenuLabel(definition, intl);
    // The user's profile, when the definition has the resource of users
    const profilePath = getProfilePath(definition, basePath);
    const locales = onLocaleChange !== undefined ? getInterfaceLocales(definition) : [];
    const openShortcutHelp = useShortcutHelp();
    const appearanceId = useId();
    const densityId = useId();
    const identityId = useId();
    const close = () => setOpen(false);

    // Who is logged in: it opens their profile, when they have one
    const identity =
        user !== null ? (
            <span className={styles.identity}>
                <span className={styles.name}>{user.name}</span>
                {/* Read as two words, though shown on two lines */}{' '}
                {user.email !== undefined ? (
                    <span className={styles.email}>{user.email}</span>
                ) : null}
            </span>
        ) : null;

    // The actions: the help of shortcuts, and "Log out" alone at the end
    const menu =
        openShortcutHelp !== null || onLogOut !== undefined ? (
            <Menu
                isInline
                aria-label={label}
                aria-describedby={user !== null ? identityId : undefined}
                onAction={close}
                className={styles.menu}
            >
                {openShortcutHelp !== null ? (
                    <MenuSection aria-label={intl.formatMessage(uiMessages.shortcutsTitle)}>
                        <MenuItem
                            id="shortcuts"
                            icon={Keyboard}
                            shortcut={SHORTCUT_HELP_KEYS}
                            onAction={openShortcutHelp}
                        >
                            {intl.formatMessage(uiMessages.shortcutsTitle)}
                        </MenuItem>
                    </MenuSection>
                ) : null}
                {openShortcutHelp !== null && onLogOut !== undefined ? <MenuSeparator /> : null}
                {onLogOut !== undefined ? (
                    <MenuSection aria-label={intl.formatMessage(appMessages.logOut)}>
                        <MenuItem id="logout" icon={LogOut} onAction={onLogOut}>
                            {intl.formatMessage(appMessages.logOut)}
                        </MenuItem>
                    </MenuSection>
                ) : null}
            </Menu>
        ) : null;

    return (
        <PopoverTrigger isOpen={isOpen} onOpenChange={setOpen}>
            {children}
            <Popover
                placement={placement}
                aria-label={label}
                className={styles.popover}
                dialogClassName={styles.dialog}
            >
                {user !== null && profilePath !== null ? (
                    <Tooltip content={intl.formatMessage(appMessages.accountProfile)}>
                        <Link
                            id={identityId}
                            href={profilePath}
                            onPress={() => {
                                close();
                                onNavigate?.();
                            }}
                            className={cx(styles.user, styles.profile)}
                        >
                            {identity}
                            <Icon icon={ChevronRight} size="sm" className={styles.chevron} />
                        </Link>
                    </Tooltip>
                ) : user !== null ? (
                    <p id={identityId} className={styles.user}>
                        {identity}
                    </p>
                ) : null}
                {/* The preferences, one row each: a small label, and its control at the end */}
                <div className={styles.settings}>
                    <div className={styles.setting}>
                        <span id={appearanceId} className={styles.settingLabel}>
                            {intl.formatMessage(appMessages.appearance)}
                        </span>
                        <SegmentedControl
                            aria-labelledby={appearanceId}
                            size="sm"
                            hideLabels
                            value={colorScheme}
                            onChange={(value) => {
                                const scheme = COLOR_SCHEMES.find((option) => option === value);
                                if (scheme !== undefined) {
                                    onColorSchemeChange(scheme);
                                }
                            }}
                            options={COLOR_SCHEMES.map((scheme) => ({
                                value: scheme,
                                label: intl.formatMessage(appMessages.colorSchemeOption, {
                                    scheme,
                                }),
                                icon: SCHEME_ICONS[scheme],
                            }))}
                        />
                    </div>
                    {onDensityChange !== undefined ? (
                        <div className={styles.setting}>
                            <span id={densityId} className={styles.settingLabel}>
                                {intl.formatMessage(appMessages.densityTitle)}
                            </span>
                            <SegmentedControl
                                aria-labelledby={densityId}
                                size="sm"
                                hideLabels
                                value={density}
                                onChange={(value) => {
                                    const choice = DENSITY_CHOICES.find(
                                        (option) => option === value,
                                    );
                                    if (choice !== undefined) {
                                        onDensityChange(choice);
                                    }
                                }}
                                options={DENSITY_CHOICES.map((choice) => ({
                                    value: choice,
                                    label: intl.formatMessage(appMessages.densityOption, {
                                        density: choice,
                                    }),
                                    icon: DENSITY_ICONS[choice],
                                }))}
                            />
                        </div>
                    ) : null}
                    {locales.length > 0 ? (
                        <div className={styles.setting}>
                            <span className={styles.settingLabel} aria-hidden="true">
                                {intl.formatMessage(appMessages.language)}
                            </span>
                            <Select
                                aria-label={intl.formatMessage(appMessages.language)}
                                isRequired
                                options={locales.map(({ locale, label: name }) => ({
                                    value: locale,
                                    label: name,
                                    lang: locale,
                                }))}
                                value={definition.locale}
                                onChange={(locale) => {
                                    if (typeof locale === 'string') {
                                        close();
                                        onLocaleChange?.(locale);
                                    }
                                }}
                                className={styles.language}
                                triggerClassName={styles.languageTrigger}
                            />
                        </div>
                    ) : null}
                </div>
                {menu}
            </Popover>
        </PopoverTrigger>
    );
}
