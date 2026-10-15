import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from './TextInput';

describe('TextInput', () => {
    it('is labelled and described', () => {
        render(<TextInput label="Title" description="Shown in search results" />);
        const input = screen.getByRole('textbox', { name: 'Title' });
        expect(input).toHaveAccessibleDescription('Shown in search results');
    });

    it('is controlled', async () => {
        const onChange = vi.fn();
        function Controlled() {
            const [value, setValue] = useState('');
            return (
                <TextInput
                    label="Title"
                    value={value}
                    onChange={(next) => {
                        setValue(next.toUpperCase());
                        onChange(next);
                    }}
                />
            );
        }
        render(<Controlled />);
        await userEvent.type(screen.getByRole('textbox'), 'ab');
        expect(onChange).toHaveBeenLastCalledWith('Ab');
        expect(screen.getByRole('textbox')).toHaveValue('AB');
    });

    it('shows its errors and is invalid', () => {
        render(<TextInput label="Title" errors={['This field is required.', 'Too short.']} />);
        const input = screen.getByRole('textbox', { name: 'Title' });
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('This field is required. Too short.');
    });

    it('marks required fields', () => {
        render(<TextInput label="Title" isRequired />);
        expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('renders a prefix and a suffix in the control', () => {
        render(<TextInput label="Slug" prefix="/pages/" suffix=".html" defaultValue="home" />);
        expect(screen.getByText('/pages/')).toBeInTheDocument();
        expect(screen.getByText('.html')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('home');
    });

    it('is read-only', async () => {
        const onChange = vi.fn();
        render(<TextInput label="Title" value="Fixed" isReadOnly onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'x');
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('adds class names to inner elements', () => {
        const { container } = render(
            <TextInput
                label="Title"
                className="field"
                labelClassName="label"
                inputClassName="input"
            />,
        );
        expect(container.firstChild).toHaveClass('field');
        expect(screen.getByText('Title')).toHaveClass('label');
        expect(screen.getByRole('textbox')).toHaveClass('input');
    });
});
