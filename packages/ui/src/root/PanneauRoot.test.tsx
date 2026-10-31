import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { uiMessages } from '@panneau/intl';

import { usePanneauIntl } from '../intl/usePanneauIntl';
import { bootstrapTheme } from '../theme/bootstrap';
import { PanneauRoot, usePortalContainer } from './PanneauRoot';
import { ThemeScope } from './ThemeScope';

function Probe() {
    const container = usePortalContainer();
    return (
        <span data-testid="probe">
            {container === undefined ? 'body' : container === null ? 'waiting' : 'container'}
        </span>
    );
}

/** A Panneau message, with the locale it is formatted in. */
function CloseLabel() {
    const intl = usePanneauIntl();
    return (
        <span data-testid="close">
            {intl.locale}: {intl.formatMessage(uiMessages.close)}
        </span>
    );
}

describe('PanneauRoot', () => {
    it('renders its children in a root with the color scheme', () => {
        render(
            <PanneauRoot data-testid="root" className="project">
                <p>Hello</p>
            </PanneauRoot>,
        );
        const root = screen.getByTestId('root');
        expect(root).toHaveAttribute('data-color-scheme', 'light');
        expect(root).toHaveAttribute('data-density', 'auto');
        expect(root).toHaveClass('project');
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('applies a theme through a scoped style', () => {
        render(
            <PanneauRoot
                data-testid="root"
                theme={bootstrapTheme}
                colorScheme="auto"
                density="compact"
            >
                <p>Hello</p>
            </PanneauRoot>,
        );
        const root = screen.getByTestId('root');
        const scope = root.getAttribute('data-panneau-theme');
        expect(scope).toMatch(/^[a-z0-9]+$/);
        const style = document.querySelector(`style[data-href="panneau-theme-${String(scope)}"]`);
        expect(style?.textContent).toContain(
            `[data-panneau-theme="${String(scope)}"]{--panneau-color-bg:var(--bs-body-bg);`,
        );
        expect(root).toHaveAttribute('data-color-scheme', 'auto');
        expect(root).toHaveAttribute('data-density', 'compact');
    });

    it('adds the fonts of a theme to the page', () => {
        render(
            <PanneauRoot
                theme={{
                    tokens: { 'panneau-font-family-heading': "'Panneau Serif', serif" },
                    fonts: [
                        { family: 'Panneau Serif', src: 'local("Georgia")' },
                        { stylesheet: 'https://fonts.example.com/serif.css' },
                    ],
                }}
            >
                <p>Hello</p>
            </PanneauRoot>,
        );
        const style = [...document.querySelectorAll('style[data-href^="panneau-fonts-"]')];
        expect(style.map((element) => element.textContent)).toContain(
            '@font-face{font-family:"Panneau Serif";src:local("Georgia");font-display:swap;}',
        );
        expect(
            document.querySelector(
                'link[rel="stylesheet"][href="https://fonts.example.com/serif.css"]',
            ),
        ).not.toBeNull();
    });

    it('gives the styles of its theme and fonts the nonce of the page, for a strict CSP', () => {
        render(
            <PanneauRoot
                data-testid="root"
                nonce="r4nd0m"
                theme={{
                    tokens: { 'panneau-color-accent': '#123456' },
                    fonts: [{ stylesheet: 'https://fonts.example.com/nonce.css' }],
                }}
            >
                <ThemeScope
                    data-testid="scope"
                    theme={{ tokens: { 'panneau-color-bg': '#fefefe' } }}
                >
                    <p>Hello</p>
                </ThemeScope>
            </PanneauRoot>,
        );
        const scopeOf = (id: string) =>
            String(screen.getByTestId(id).getAttribute('data-panneau-theme'));
        expect(
            document.querySelector(`style[data-href="panneau-theme-${scopeOf('root')}"]`),
        ).toHaveAttribute('nonce', 'r4nd0m');
        expect(
            document.querySelector(`style[data-href="panneau-theme-${scopeOf('scope')}"]`),
        ).toHaveAttribute('nonce', 'r4nd0m');
        expect(
            document.querySelector('link[href="https://fonts.example.com/nonce.css"]'),
        ).toHaveAttribute('nonce', 'r4nd0m');
    });

    it('reads the nonce where React Aria does, without one given', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'csp-nonce');
        meta.setAttribute('content', 'fr0m-m3ta');
        document.head.append(meta);
        try {
            render(
                <PanneauRoot
                    data-testid="root"
                    theme={{ tokens: { 'panneau-color-text': '#0a0a0a' } }}
                >
                    <p>Hello</p>
                </PanneauRoot>,
            );
            const scope = String(screen.getByTestId('root').getAttribute('data-panneau-theme'));
            expect(
                document.querySelector(`style[data-href="panneau-theme-${scope}"]`),
            ).toHaveAttribute('nonce', 'fr0m-m3ta');
        } finally {
            meta.remove();
        }
    });

    it('gives overlays a container inside the root', () => {
        render(
            <PanneauRoot>
                <Probe />
            </PanneauRoot>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('container');
    });

    it('has no container outside of a root', () => {
        render(<Probe />);
        expect(screen.getByTestId('probe')).toHaveTextContent('body');
    });

    it('renders without an IntlProvider, and inside one', () => {
        render(
            <IntlProvider locale="fr">
                <PanneauRoot>
                    <p>Bonjour</p>
                </PanneauRoot>
            </IntlProvider>,
        );
        expect(screen.getByText('Bonjour')).toBeInTheDocument();
    });

    it('provides Panneau’s messages in its locale without an IntlProvider', () => {
        const error = vi.spyOn(console, 'error');
        render(
            <PanneauRoot locale="fr">
                <CloseLabel />
            </PanneauRoot>,
        );
        expect(screen.getByTestId('close')).toHaveTextContent('fr: Fermer');
        expect(error).not.toHaveBeenCalled();
        error.mockRestore();
    });

    it('takes the messages of the language of a regional locale', () => {
        render(
            <PanneauRoot locale="fr-CA">
                <CloseLabel />
            </PanneauRoot>,
        );
        expect(screen.getByTestId('close')).toHaveTextContent('fr-CA: Fermer');
    });

    it('provides English without a locale, or for a locale Panneau doesn’t translate', () => {
        const error = vi.spyOn(console, 'error');
        render(
            <>
                <PanneauRoot>
                    <CloseLabel />
                </PanneauRoot>
                <PanneauRoot locale="es">
                    <CloseLabel />
                </PanneauRoot>
            </>,
        );
        expect(screen.getAllByTestId('close').map((element) => element.textContent)).toEqual([
            'en: Close',
            'en: Close',
        ]);
        expect(error).not.toHaveBeenCalled();
        error.mockRestore();
    });

    it('keeps the app’s IntlProvider and its messages', () => {
        render(
            <IntlProvider locale="fr" messages={{ 'panneau.ui.close': 'Fermer la fenêtre' }}>
                <PanneauRoot locale="en">
                    <CloseLabel />
                </PanneauRoot>
            </IntlProvider>,
        );
        expect(screen.getByTestId('close')).toHaveTextContent('fr: Fermer la fenêtre');
    });

    it('provides one IntlProvider for nested roots', () => {
        render(
            <PanneauRoot locale="fr">
                <PanneauRoot locale="en">
                    <CloseLabel />
                </PanneauRoot>
            </PanneauRoot>,
        );
        expect(screen.getByTestId('close')).toHaveTextContent('fr: Fermer');
    });
});
