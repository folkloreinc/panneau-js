import type { Decorator, Preview } from '@storybook/react-vite';
// Bootstrap's CSS, only rendered with the Bootstrap theme, to check Panneau next to it.
import bootstrapCss from 'bootstrap/dist/css/bootstrap.min.css?inline';
import { IntlProvider } from 'react-intl';

import { type ColorScheme, PanneauRoot, bootstrapTheme } from '@panneau/ui';
import { fr as uiFr } from '@panneau/ui/locales';

const MESSAGES: Record<string, Record<string, string>> = { en: {}, fr: { ...uiFr } };

/** Every story renders in a PanneauRoot, with the locale, color scheme and theme of the toolbar. */
const withPanneau: Decorator = (Story, { globals }) => {
    const locale = String(globals.locale ?? 'en');
    const colorScheme = (globals.colorScheme as ColorScheme | undefined) ?? 'light';
    const theme = globals.theme === 'bootstrap' ? bootstrapTheme : null;
    return (
        <IntlProvider locale={locale} messages={MESSAGES[locale]} defaultLocale="en">
            {theme !== null ? <style>{bootstrapCss}</style> : null}
            <PanneauRoot
                data-bs-theme={theme !== null && colorScheme !== 'auto' ? colorScheme : undefined}
                colorScheme={colorScheme}
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
        theme: {
            description: 'Theme',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: [
                    { value: 'default', title: 'Default' },
                    { value: 'bootstrap', title: 'Bootstrap' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { locale: 'en', colorScheme: 'light', theme: 'default' },
    parameters: {
        layout: 'fullscreen',
        controls: { expanded: true },
        // Accessibility violations fail the story's test (in CI through the Vitest addon).
        a11y: {
            test: 'error',
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
