import { Keyboard, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react';
import type { ReactElement } from 'react';

import { appMessages, uiMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import {
    Avatar,
    type AvatarSize,
    type IconComponent,
    Menu,
    MenuItem,
    type MenuProps,
    MenuSection,
    MenuSeparator,
    MenuTrigger,
    usePanneauIntl,
    useShortcutHelp,
} from '@panneau/ui';

import { getInterfaceLocales } from '../interfaceLocales';
import { getProfilePath } from '../navigation';
import styles from './UserMenu.module.css';
import { DENSITY_CHOICES, DENSITY_ICONS, type DensityChoice } from './density';

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
 * The user's menu (decision 0086), behind their avatar and name: who is logged in, their profile,
 * the appearance, the density (decision 0104) and the language as choices with a check, the
 * help of keyboard shortcuts (decision 0110), and "Log out". The sidebar and the dock
 * share it.
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
    const user = definition.user ?? null;
    // The user's profile, when the definition has the resource of users
    const profilePath = getProfilePath(definition, basePath);
    const locales = onLocaleChange !== undefined ? getInterfaceLocales(definition) : [];
    const openShortcutHelp = useShortcutHelp();

    return (
        <MenuTrigger>
            {children}
            <Menu placement={placement} popoverClassName={styles.popover}>
                {user !== null ? (
                    <MenuSection
                        title={
                            <span className={styles.user}>
                                <span className={styles.name}>{user.name}</span>
                                {/* Read as two words, though shown on two lines */}{' '}
                                {user.email !== undefined ? (
                                    <span className={styles.email}>{user.email}</span>
                                ) : null}
                            </span>
                        }
                        headerClassName={styles.header}
                    >
                        {profilePath !== null ? (
                            <MenuItem
                                id="profile"
                                href={profilePath}
                                icon={UserRound}
                                onAction={onNavigate}
                            >
                                {intl.formatMessage(appMessages.accountProfile)}
                            </MenuItem>
                        ) : null}
                    </MenuSection>
                ) : null}
                {user !== null ? <MenuSeparator /> : null}
                <MenuSection
                    title={intl.formatMessage(appMessages.appearance)}
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[colorScheme]}
                    onSelectionChange={(keys) => {
                        const [key] = keys === 'all' ? [] : [...keys];
                        const scheme = COLOR_SCHEMES.find((value) => value === key);
                        if (scheme !== undefined) {
                            onColorSchemeChange(scheme);
                        }
                    }}
                >
                    {COLOR_SCHEMES.map((scheme) => (
                        <MenuItem key={scheme} id={scheme} icon={SCHEME_ICONS[scheme]}>
                            {intl.formatMessage(appMessages.colorSchemeOption, { scheme })}
                        </MenuItem>
                    ))}
                </MenuSection>
                {onDensityChange !== undefined ? (
                    <MenuSection
                        title={intl.formatMessage(appMessages.densityTitle)}
                        selectionMode="single"
                        disallowEmptySelection
                        // Prefixed: the ids of a menu are unique
                        selectedKeys={[`density-${density}`]}
                        onSelectionChange={(keys) => {
                            const [key] = keys === 'all' ? [] : [...keys];
                            const choice = DENSITY_CHOICES.find(
                                (value) => `density-${value}` === key,
                            );
                            if (choice !== undefined) {
                                onDensityChange(choice);
                            }
                        }}
                    >
                        {DENSITY_CHOICES.map((choice) => (
                            <MenuItem
                                key={choice}
                                id={`density-${choice}`}
                                icon={DENSITY_ICONS[choice]}
                            >
                                {intl.formatMessage(appMessages.densityOption, { density: choice })}
                            </MenuItem>
                        ))}
                    </MenuSection>
                ) : null}
                {locales.length > 0 ? (
                    <MenuSection
                        title={intl.formatMessage(appMessages.language)}
                        selectionMode="single"
                        disallowEmptySelection
                        // Prefixed: the ids of a menu are unique, and a locale could be "dark"
                        selectedKeys={[`locale-${definition.locale}`]}
                        onSelectionChange={(keys) => {
                            const [key] = keys === 'all' ? [] : [...keys];
                            if (typeof key === 'string' && key.startsWith('locale-')) {
                                onLocaleChange?.(key.slice('locale-'.length));
                            }
                        }}
                    >
                        {locales.map(({ locale, label }) => (
                            <MenuItem key={locale} id={`locale-${locale}`} textValue={label}>
                                <span lang={locale}>{label}</span>
                            </MenuItem>
                        ))}
                    </MenuSection>
                ) : null}
                {openShortcutHelp !== null ? (
                    <MenuSection aria-label={intl.formatMessage(uiMessages.shortcutsTitle)}>
                        <MenuItem id="shortcuts" icon={Keyboard} onAction={openShortcutHelp}>
                            {intl.formatMessage(uiMessages.shortcutsTitle)}
                        </MenuItem>
                    </MenuSection>
                ) : null}
                {onLogOut !== undefined ? <MenuSeparator /> : null}
                {onLogOut !== undefined ? (
                    <MenuSection aria-label={intl.formatMessage(appMessages.logOut)}>
                        <MenuItem id="logout" icon={LogOut} onAction={onLogOut}>
                            {intl.formatMessage(appMessages.logOut)}
                        </MenuItem>
                    </MenuSection>
                ) : null}
            </Menu>
        </MenuTrigger>
    );
}
