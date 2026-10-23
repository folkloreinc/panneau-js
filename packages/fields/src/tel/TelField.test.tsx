import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TelField } from './TelField';

describe('TelField', () => {
    it('is a phone input that trims on blur', async () => {
        const onChange = vi.fn();
        renderField(<TelField label="Phone" value=" 514 555-0199 " onChange={onChange} />);
        const input = screen.getByRole('textbox', { name: 'Phone' });
        expect(input).toHaveAttribute('type', 'tel');
        expect(input).toHaveAttribute('inputmode', 'tel');
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('514 555-0199');
    });

    it('renders from a definition', () => {
        renderField(
            <DefinitionField
                field={{ name: 'phone', type: 'tel', label: 'Phone' }}
                path="phone"
                value="514 555-0199"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('514 555-0199');
    });
});
