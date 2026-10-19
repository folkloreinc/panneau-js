import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Prose } from './Prose';
import styles from './Prose.module.css';

describe('Prose', () => {
    it('wraps rich content', () => {
        render(
            <Prose as="article" aria-label="Help">
                <h2>Publishing</h2>
                <p>Text</p>
            </Prose>,
        );
        const prose = screen.getByRole('article', { name: 'Help' });
        expect(prose).toHaveClass('panneau-prose', String(styles.prose));
        expect(screen.getByRole('heading', { level: 2 })).not.toHaveAttribute('class');
    });
});
