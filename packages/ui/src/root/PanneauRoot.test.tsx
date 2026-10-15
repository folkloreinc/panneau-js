import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it } from 'vitest';

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
});
