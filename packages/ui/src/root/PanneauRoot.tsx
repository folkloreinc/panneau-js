import { type HTMLAttributes, type ReactNode, createContext, use, useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { IntlContext, IntlProvider, type IntlShape } from 'react-intl';

import { getPanneauMessages } from '@panneau/intl';

import { type ColorScheme, type Theme, getThemeCss, hashString } from '../theme/theme';
import { ToastProvider } from '../toast/Toast';
import { cx } from '../utils/cx';
import styles from './PanneauRoot.module.css';

export interface PanneauRootProps extends HTMLAttributes<HTMLDivElement> {
    /** Tokens that override the default theme: `bootstrapTheme`, or a project's own. */
    theme?: Theme | null;
    /** Defaults to `light`. `auto` follows the system setting. */
    colorScheme?: ColorScheme;
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
    children?: ReactNode;
}

/** `undefined` outside of a root, `null` while the root's container isn't mounted yet. */
const PortalContext = createContext<Element | null | undefined>(undefined);

/**
 * The element overlays render into: the closest `PanneauRoot`'s, or `undefined` for the body
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
    children,
}: {
    locale?: string;
    children: ReactNode;
}) {
    const messages = getPanneauMessages(locale);
    const translated = Object.keys(messages).length > 0;
    return (
        <IntlProvider
            locale={translated ? locale : 'en'}
            defaultLocale="en"
            messages={translated ? messages : getPanneauMessages('en')}
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
    locale,
    className,
    children,
    ...props
}: PanneauRootProps) {
    const intl = use(IntlContext) as IntlShape | null | undefined;
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const css = theme !== null ? getThemeCss(theme, '§') : '';
    const scope = css !== '' ? hashString(css) : undefined;
    const root = (
        <div
            data-panneau="root"
            {...props}
            className={cx(styles.root, className)}
            data-color-scheme={colorScheme}
            data-panneau-theme={scope}
        >
            {scope !== undefined ? (
                <style href={`panneau-theme-${scope}`} precedence="panneau">
                    {css.replaceAll('§', scope)}
                </style>
            ) : null}
            <I18nProvider locale={locale ?? intl?.locale}>
                <PortalContext value={container}>
                    <ToastProvider
                        regionClassName={styles.root}
                        regionProps={{
                            'data-color-scheme': colorScheme,
                            'data-panneau-theme': scope,
                        }}
                    >
                        {children}
                    </ToastProvider>
                </PortalContext>
                <div ref={setContainer} className={styles.portal} />
            </I18nProvider>
        </div>
    );
    if (intl === null || intl === undefined) {
        return <PanneauIntlProvider locale={locale}>{root}</PanneauIntlProvider>;
    }
    return root;
}
