import { type HTMLAttributes, type ReactNode, createContext, use, useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { IntlContext, type IntlShape } from 'react-intl';

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
 * The root of every Panneau interface. It scopes the base stylesheet and the design tokens to its
 * element (no global CSS), applies a theme and a color scheme, and hosts overlays and toasts so
 * that they get the tokens too. Panneau components must render inside one. A project can override
 * any token with its own class on the root.
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
    return (
        <div
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
}
