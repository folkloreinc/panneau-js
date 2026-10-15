import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { type OptionValue, Select, type SelectOption } from './Select';

const OPTIONS: SelectOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published', description: 'Visible on the site' },
    { value: 'archived', label: 'Archived', disabled: true },
];

describe('Select', () => {
    it('picks an option', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot>
                <Select label="Status" options={OPTIONS} value={null} onChange={onChange} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Status/ }));
        const listbox = await screen.findByRole('listbox');
        expect(within(listbox).getByRole('option', { name: /Archived/ })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        await userEvent.click(within(listbox).getByRole('option', { name: /Published/ }));
        expect(onChange).toHaveBeenCalledWith('published');
    });

    it('shows the selected option, and can be emptied unless required', async () => {
        function Controlled() {
            const [value, setValue] = useState<OptionValue | null>('draft');
            return <Select label="Status" options={OPTIONS} value={value} onChange={setValue} />;
        }
        render(
            <PanneauRoot>
                <Controlled />
            </PanneauRoot>,
        );
        const trigger = screen.getByRole('button', { name: /Status/ });
        expect(trigger).toHaveTextContent('Draft');
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByRole('option', { name: 'Select…' }));
        expect(trigger).toHaveTextContent('Select…');
    });

    it('has no empty option when required', async () => {
        render(
            <PanneauRoot>
                <Select label="Status" options={OPTIONS} isRequired />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Status/ }));
        expect(await screen.findAllByRole('option')).toHaveLength(3);
    });

    it('keeps the type of values', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot>
                <Select
                    label="Featured"
                    options={[
                        { value: true, label: 'Yes' },
                        { value: false, label: 'No' },
                    ]}
                    onChange={onChange}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Featured/ }));
        await userEvent.click(await screen.findByRole('option', { name: 'No' }));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('selects several values with multiple', async () => {
        function Controlled({ onChange }: { onChange: (value: OptionValue[]) => void }) {
            const [value, setValue] = useState<OptionValue[]>(['draft']);
            return (
                <Select
                    multiple
                    label="Statuses"
                    options={OPTIONS}
                    value={value}
                    onChange={(next) => {
                        setValue(next);
                        onChange(next);
                    }}
                />
            );
        }
        const onChange = vi.fn();
        render(
            <PanneauRoot>
                <Controlled onChange={onChange} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Statuses/ }));
        await userEvent.click(await screen.findByRole('option', { name: /Published/ }));
        expect(onChange).toHaveBeenLastCalledWith(['draft', 'published']);
    });

    it('shows its errors', () => {
        render(<Select label="Status" options={OPTIONS} errors={['Pick a status.']} />);
        expect(screen.getByText('Pick a status.')).toBeInTheDocument();
    });
});
