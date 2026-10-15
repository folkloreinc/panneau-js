import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { ComboBox, type ComboBoxItem } from './ComboBox';

const AUTHORS: ComboBoxItem[] = [
    { id: '1', label: 'Ada Lovelace' },
    { id: '2', label: 'Grace Hopper', description: 'Compilers' },
];

describe('ComboBox', () => {
    it('suggests items and picks one', async () => {
        const onChange = vi.fn();
        function Search() {
            const [query, setQuery] = useState('');
            const items = AUTHORS.filter((author) =>
                author.label.toLowerCase().includes(query.toLowerCase()),
            );
            return (
                <ComboBox
                    label="Author"
                    items={items}
                    inputValue={query}
                    onInputChange={setQuery}
                    onChange={onChange}
                />
            );
        }
        render(
            <PanneauRoot>
                <Search />
            </PanneauRoot>,
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'gra');
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(1);
        await userEvent.click(screen.getByRole('option', { name: /Grace Hopper/ }));
        expect(onChange).toHaveBeenCalledWith('2');
    });

    it('says when nothing matches', async () => {
        render(
            <PanneauRoot>
                <ComboBox label="Author" items={[]} emptyMessage="No authors" />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        expect(await screen.findByText('No authors')).toBeInTheDocument();
    });

    it('shows a spinner while loading', () => {
        render(<ComboBox label="Author" items={[]} isLoading />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows its errors', () => {
        render(<ComboBox label="Author" items={AUTHORS} errors={['Pick an author.']} />);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });
});
