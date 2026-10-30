import { type HTMLAttributes, type ReactNode, createContext, use, useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { IntlContext, IntlProvider, type IntlShape } from 'react-intl';

import { getPanneauMessages } from '@panneau/intl';

import { type NamedIconLoader, NamedIconLoaderContext } from '../icon/namedIcons';
import { getFontFaceCss, getFontStylesheets } from '../theme/fonts';
import {
    type ColorScheme,
    type Density,
    type Theme,
    getThemeCss,
    hashString,
} from '../theme/theme';
import { ToastProvider } from '../toast/Toast';
import { cx } from '../utils/cx';
import styles from './PanneauRoot.module.css';

export interface PanneauRootProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Tokens, tones, variants and fonts that override the default theme: `bootstrapTheme`, or a
     * project's own (`defineTheme()`).
     */
    theme?: Theme | null;
    /** Defaults to `light`. `auto` follows the system setting. */
    colorScheme?: ColorScheme;
    /**
     * How much room controls and rows take: `compact`, `comfortable` or `touch`. Defaults to
     * `auto`: `touch` on touch screens, `comfortable` otherwise.
     */
    density?: Density;
    /**
     * Loads the icons that definitions name (`"icon": "send"`), for `getNamedIcon()`: pass
     * `lucideIconLoader` from `@panneau/ui/named-icons`, or a loader of only the icons the app
     * uses. Without it, named icons render an empty space.
     */
    iconLoader?: NamedIconLoader | null;
    /**
     * Locale of dates and numbers in React Aria components. Defaults to the react-intl locale, or
     * to the browser's without an `IntlProvider`.
     *
     * Without an `IntlProvider` above it, the root provides one, with the messages of every Panneau
     * package in this locale (English without a locale, or for a locale Panneau doesn't translate).
     * An app with its own `IntlProvider` adds them with `withPanneauMessages()` from
     * `@panneau/intl`.
     */
    locale?: string;
    /**
     * Messages added to Panneau's, by id, when the root provides the `IntlProvider`: those of
     * plugins (`loadMessages()` of `@panneau/core`). An app with its own `IntlProvider` adds them
     * to its own.
     */
    messages?: Readonly<Record<string, string>> | null;
    children?: ReactNode;
}

/** `undefined` outside of a root, `null` while the root's container isn't mounted yet. */
const PortalContext = createContext<Element | null | undefined>(undefined);

/** The color scheme and density in effect, which a `ThemeScope` inherits when it doesn't set them. */
export const ScopeContext = createContext<{ colorScheme: ColorScheme; density: Density }>({
    colorScheme: 'light',
    density: 'auto',
});

/** Gives overlays a container: that of a root, or of a scope. */
export const PortalProvider = PortalContext.Provider;

/**
 * The `<style>` and `<link>` elements of a theme: its CSS, scoped to `data-panneau-theme`, and its
 * fonts. React hoists them to the head and adds each once, however many roots or scopes use it.
 * Returns the scope of the theme too, for `data-panneau-theme`.
 */
export function useThemeStyles(theme: Theme | null): { scope?: string; styles: ReactNode } {
    const css = theme !== null ? getThemeCss(theme, '§') : '';
    const scope = css !== '' ? hashString(css) : undefined;
    const fontCss = getFontFaceCss(theme?.fonts);
    return {
        scope,
        styles: (
            <>
                {scope !== undefined ? (
                    <style href={`panneau-theme-${scope}`} precedence="panneau">
                        {css.replaceAll('§', scope)}
                    </style>
                ) : null}
                {fontCss !== '' ? (
                    <style href={`panneau-fonts-${hashString(fontCss)}`} precedence="panneau">
                        {fontCss}
                    </style>
                ) : null}
                {getFontStylesheets(theme?.fonts).map((href) => (
                    <link key={href} rel="stylesheet" href={href} precedence="panneau" />
                ))}
            </>
        ),
    };
}

/**
 * The element overlays render into: the closest `PanneauRoot`'s or `ThemeScope`'s, or `undefined` for the body
 * without a root. It is `null` during the first render of a root: overlays wait for it, since
 * React Aria hides everything outside of a modal from assistive technologies when it opens.
 */
export function usePortalContainer(): Element | null | undefined {
    return use(PortalContext);
}

/**
 * An `IntlProvider` with Panneau's messages in a locale, for a root without one above it. A locale
 * Panneau doesn't translate gets English, so that react-intl doesn't report every message as
 * missing.
 */
function PanneauIntlProvider({
    locale = 'en',
    messages: added,
    children,
}: {
    locale?: string;
    messages?: Readonly<Record<string, string>> | null;
    children: ReactNode;
}) {
    const messages = getPanneauMessages(locale);
    const translated = Object.keys(messages).length > 0;
    return (
        <IntlProvider
            locale={translated ? locale : 'en'}
            defaultLocale="en"
            messages={{ ...(translated ? messages : getPanneauMessages('en')), ...added }}
        >
            {children}
        </IntlProvider>
    );
}

/**
 * The root of every Panneau interface. It scopes the base stylesheet and the design tokens to its
 * element (no global CSS), applies a theme and a color scheme, and hosts overlays and toasts so
 * that they get the tokens too. Panneau components must render inside one. A project can override
 * any token with its own class on the root. Without an `IntlProvider` above it, it provides one
 * with Panneau's messages in its `locale`.
 */
export function PanneauRoot({
    theme = null,
    colorScheme = 'light',
    density = 'auto',
    iconLoader = null,
    locale,
    messages,
    className,
    children,
    ...props
}: PanneauRootProps) {
    const intl = use(IntlContext) as IntlShape | null | undefined;
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const { scope, styles: themeStyles } = useThemeStyles(theme);
    const root = (
        <div
            {...props}
            className={cx('panneau-root', styles.root, styles.container, className)}
            data-color-scheme={colorScheme}
            data-density={density}
            data-panneau-theme={scope}
        >
            {themeStyles}
            <I18nProvider locale={locale ?? intl?.locale}>
                <NamedIconLoaderContext value={iconLoader}>
                    <ScopeContext value={{ colorScheme, density }}>
                        <PortalContext value={container}>
                            <ToastProvider
                                regionClassName={styles.root}
                                regionProps={{
                                    'data-color-scheme': colorScheme,
                                    'data-density': density,
                                    'data-panneau-theme': scope,
                                }}
                            >
                                {children}
                            </ToastProvider>
                        </PortalContext>
                    </ScopeContext>
                </NamedIconLoaderContext>
                <div ref={setContainer} className={styles.portal} />
            </I18nProvider>
        </div>
    );
    if (intl === null || intl === undefined) {
        return (
            <PanneauIntlProvider locale={locale} messages={messages}>
                {root}
            </PanneauIntlProvider>
        );
    }
    return root;
}
