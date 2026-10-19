import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Heading } from './Heading';
import styles from './Heading.module.css';

describe('Heading', () => {
    it('is a level 2 heading by default', () => {
        render(<Heading>Members</Heading>);
        const heading = screen.getByRole('heading', { level: 2, name: 'Members' });
        expect(heading).toHaveClass('panneau-heading', String(styles['size-2']));
    });

    it('takes a size independent of its level', () => {
        render(
            <>
                <Heading level={1} size="display-1" id="title">
                    Dashboard
                </Heading>
                <Heading level={6}>Notes</Heading>
            </>,
        );
        const title = screen.getByRole('heading', { level: 1 });
        expect(title).toHaveClass(String(styles['size-display-1']));
        expect(title).toHaveAttribute('id', 'title');
        expect(screen.getByRole('heading', { level: 6 })).toHaveClass(String(styles['size-4']));
    });
});
