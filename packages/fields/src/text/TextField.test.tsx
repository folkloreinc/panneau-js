import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TextField } from './TextField';

describe('TextField', () => {
    it('is controlled, and empty is null', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<string | null> initial="Hi" onChange={onChange}>
                {(value, setValue) => <TextField label="Title" value={value} onChange={setValue} />}
            </Controlled>,
        );
        const input = screen.getByRole('textbox', { name: 'Title' });
        await userEvent.type(input, '!');
        expect(onChange).toHaveBeenLastCalledWith('Hi!');
        await userEvent.clear(input);
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('shows errors, the required mark and a character count', () => {
        renderField(
            <TextField
                label="Title"
                value="Hello"
                required
                maxLength={10}
                description="Short."
                errors={['Too long.']}
            />,
        );
        const input = screen.getByRole('textbox', { name: /Title/ });
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Short. 5 / 10 characters Too long.');
    });

    it('is read-only and disabled', () => {
        renderField(
            <>
                <TextField label="A" value="x" readOnly />
                <TextField label="B" value="y" disabled />
            </>,
        );
        expect(screen.getByRole('textbox', { name: 'A' })).toHaveAttribute('readonly');
        expect(screen.getByRole('textbox', { name: 'B' })).toBeDisabled();
    });

    it('renders from a definition', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'title',
                    type: 'text',
                    label: 'Title',
                    help: 'In search results.',
                    placeholder: 'A title',
                    rules: [{ rule: 'required' }, { rule: 'max', value: 60 }],
                    settings: { prefix: '#' },
                }}
                path="title"
                value="Hi"
                onChange={() => undefined}
            />,
        );
        const input = screen.getByRole('textbox', { name: /Title/ });
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('placeholder', 'A title');
        expect(input).toHaveAttribute('name', 'title');
        expect(screen.getByText('#')).toBeInTheDocument();
        expect(input).toHaveAccessibleDescription('In search results. 2 / 60 characters');
    });
});
