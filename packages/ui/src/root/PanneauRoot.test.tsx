import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { uiMessages } from '@panneau/intl';

import { usePanneauIntl } from '../intl/usePanneauIntl';
import { bootstrapTheme } from '../theme/bootstrap';
import { PanneauRoot, usePortalContainer } from './PanneauRoot';

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
        expect(root).toHaveClass('project');
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('applies a theme through a scoped style', () => {
        render(
            <PanneauRoot data-testid="root" theme={bootstrapTheme} colorScheme="auto">
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
