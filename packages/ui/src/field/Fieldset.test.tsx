import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Fieldset } from './Fieldset';

describe('Fieldset', () => {
    it('groups controls under a legend, with a description and errors', () => {
        render(
            <Fieldset
                legend="Address"
                description="Where to send it"
                errors={['Incomplete.']}
                isRequired
            >
                <input aria-label="Street" />
            </Fieldset>,
        );
        const group = screen.getByRole('group', { name: 'Address' });
        expect(group).toHaveAccessibleDescription('Where to send it Incomplete.');
        expect(group).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('textbox', { name: 'Street' })).toBeInTheDocument();
    });

    it('disables its controls', () => {
        render(
            <Fieldset legend="Address" isDisabled>
                <input aria-label="Street" />
            </Fieldset>,
        );
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});
