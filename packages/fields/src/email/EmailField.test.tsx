import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { EmailField } from './EmailField';

describe('EmailField', () => {
    it('is an email input that trims on blur', async () => {
        const onChange = vi.fn();
        const onBlur = vi.fn();
        renderField(
            <EmailField
                label="Email"
                value=" ada@example.com "
                onChange={onChange}
                onBlur={onBlur}
            />,
        );
        const input = screen.getByRole('textbox', { name: 'Email' });
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('inputmode', 'email');
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('ada@example.com');
        expect(onBlur).toHaveBeenCalled();
    });

    it('renders from a definition', () => {
        renderField(
            <DefinitionField
                field={{ name: 'email', type: 'email', label: 'Email' }}
                path="email"
                value="ada@example.com"
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@example.com');
    });
});
