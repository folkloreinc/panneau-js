import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Text } from './Text';
import styles from './Text.module.css';

describe('Text', () => {
    it('is a paragraph that inherits its style by default', () => {
        render(<Text>Body</Text>);
        const text = screen.getByText('Body');
        expect(text.nodeName).toBe('P');
        expect(text).toHaveClass('panneau-text', String(styles.text), { exact: true });
    });

    it('applies sizes, weights, roles and modifiers', () => {
        render(
            <Text as="span" size="sm" weight="medium" family="mono" muted numeric truncate>
                #1234
            </Text>,
        );
        const text = screen.getByText('#1234');
        expect(text.nodeName).toBe('SPAN');
        expect(text).toHaveClass(
            String(styles['size-sm']),
            String(styles['weight-medium']),
            String(styles['family-mono']),
            String(styles.muted),
            String(styles.numeric),
            String(styles.truncate),
        );
    });

    it('takes a tone', () => {
        render(<Text tone="danger">Failed</Text>);
        expect(screen.getByText('Failed')).toHaveClass('panneau-tone-danger', String(styles.toned));
    });
});
