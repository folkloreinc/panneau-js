import type { Decorator, Preview } from '@storybook/react-vite';
// Bootstrap's CSS, only rendered with the Bootstrap theme, to check Panneau next to it.
import bootstrapCss from 'bootstrap/dist/css/bootstrap.min.css?inline';
import { IntlProvider } from 'react-intl';

import { panneauMessages } from '@panneau/intl';
import {
    type ColorScheme,
    type Density,
    PanneauRoot,
    type Theme,
    bootstrapTheme,
} from '@panneau/ui';

import { referenceTheme } from '../packages/ui/src/theme/__fixtures__/referenceTheme';

/**
 * Themes of the toolbar: the default one, Bootstrap's (with Bootstrap's CSS), and the reference
 * theme, which is as different from the default as a project's could be.
 */
const THEMES: Record<string, Theme | null> = {
    default: null,
    bootstrap: bootstrapTheme,
    reference: referenceTheme,
};

/** Every story renders in a PanneauRoot, with the locale, color scheme and theme of the toolbar. */
const withPanneau: Decorator = (Story, { globals }) => {
    const locale = String(globals.locale ?? 'en');
    const colorScheme = (globals.colorScheme as ColorScheme | undefined) ?? 'light';
    const density = (globals.density as Density | undefined) ?? 'auto';
    const theme = THEMES[String(globals.theme)] ?? null;
    const bootstrap = theme === bootstrapTheme;
    return (
        <IntlProvider locale={locale} messages={panneauMessages[locale]} defaultLocale="en">
            {bootstrap ? <style>{bootstrapCss}</style> : null}
            <PanneauRoot
                data-bs-theme={bootstrap && colorScheme !== 'auto' ? colorScheme : undefined}
                colorScheme={colorScheme}
                density={density}
                theme={theme}
                style={{ padding: '1rem', minHeight: '100vh' }}
            >
                <Story />
            </PanneauRoot>
        </IntlProvider>
    );
};

const preview: Preview = {
    decorators: [withPanneau],
    globalTypes: {
        locale: {
            description: 'Locale of the UI',
            toolbar: {
                title: 'Locale',
                icon: 'globe',
                items: [
                    { value: 'en', title: 'English' },
                    { value: 'fr', title: 'Français' },
                ],
                dynamicTitle: true,
            },
        },
        colorScheme: {
            description: 'Color scheme',
            toolbar: {
                title: 'Scheme',
                icon: 'mirror',
                items: ['light', 'dark', 'auto'],
                dynamicTitle: true,
            },
        },
        density: {
            description: 'Density',
            toolbar: {
                title: 'Density',
                icon: 'component',
                items: ['auto', 'compact', 'comfortable', 'touch'],
                dynamicTitle: true,
            },
        },
        theme: {
            description: 'Theme',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: [
                    { value: 'default', title: 'Default' },
                    { value: 'bootstrap', title: 'Bootstrap' },
                    { value: 'reference', title: 'Reference' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { locale: 'en', colorScheme: 'light', density: 'auto', theme: 'default' },
    parameters: {
        layout: 'fullscreen',
        controls: { expanded: true },
        // Accessibility violations fail the story's test (in CI through the Vitest addon).
        a11y: {
            test: 'error',
            context: {
                include: ['body'],
                // React Aria announces some changes through a live region in the body, with
                // `role="img"` messages labelled by elements that a later story no longer has.
                exclude: ['[aria-live] > [role="img"]'],
            },
            config: {
                rules: [
                    // Options and menu items with a description are labelled by their label and
                    // described by their description (React Aria's slots), which is the intended
                    // pattern: this rule expects every visible text in the name.
                    { id: 'label-content-name-mismatch', enabled: false },
                ],
            },
        },
    },
};

export default preview;
