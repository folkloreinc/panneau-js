import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

    it('shows prefixes before the text and the labels, hidden from assistive technologies', async () => {
        render(
            <PanneauRoot>
                <ComboBox
                    label="Country"
                    items={[{ id: 'CA', label: 'Canada', prefix: '🇨🇦' }]}
                    value="CA"
                    prefix="🇨🇦"
                />
            </PanneauRoot>,
        );
        const input = screen.getByRole('combobox', { name: 'Country' });
        expect(input).toHaveValue('Canada');
        expect(screen.getByText('🇨🇦')).toHaveAttribute('aria-hidden', 'true');
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        expect(await screen.findByRole('option', { name: 'Canada' })).toHaveTextContent('🇨🇦');
    });

    it('draws a read-only control as read-only, without its button', () => {
        render(<ComboBox label="Country" items={[]} isReadOnly />);
        expect(screen.getByRole('combobox').parentElement).toHaveAttribute('data-readonly', 'true');
        expect(screen.queryByRole('button', { name: /Show options/ })).toBeNull();
    });

    it('shows a spinner while loading', () => {
        render(<ComboBox label="Author" items={[]} isLoading />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows its errors', () => {
        render(<ComboBox label="Author" items={AUTHORS} errors={['Pick an author.']} />);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows the badge of an item at the end of its row, read with its description', async () => {
        render(
            <PanneauRoot>
                <ComboBox
                    label="Article"
                    items={[
                        {
                            id: '1',
                            label: 'Summer',
                            description: 'Travel',
                            badge: { label: 'Draft', tone: 'neutral' },
                        },
                        { id: '2', label: 'Winter', badge: { label: 'Archived', tone: 'muted' } },
                    ]}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        const summer = await screen.findByRole('option', { name: 'Summer' });
        expect(summer).toHaveAccessibleDescription('Travel, Draft');
        expect(screen.getByRole('option', { name: 'Winter' })).toHaveAccessibleDescription(
            'Archived',
        );
        const badge = summer.querySelector('.panneau-badge');
        expect(badge).toHaveTextContent('Draft');
        expect(badge).toHaveClass('panneau-tone-neutral');
        expect(badge?.parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows a footer under its items', async () => {
        render(
            <PanneauRoot>
                <ComboBox label="Author" items={AUTHORS} footer="2 of 40 results" />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        expect(await screen.findByText('2 of 40 results')).toBeInTheDocument();
    });

    describe('loading more', () => {
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('loads more items once the end of the list shows', async () => {
            // The end of the list is in view at once
            vi.stubGlobal(
                'IntersectionObserver',
                class {
                    constructor(
                        private readonly callback: (entries: { isIntersecting: boolean }[]) => void,
                    ) {}
                    observe() {
                        this.callback([{ isIntersecting: true }]);
                    }
                    disconnect() {}
                },
            );
            const onLoadMore = vi.fn();
            render(
                <PanneauRoot>
                    <ComboBox
                        label="Author"
                        items={AUTHORS}
                        onLoadMore={onLoadMore}
                        isLoadingMore
                    />
                </PanneauRoot>,
            );
            await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
            expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeInTheDocument();
            expect(onLoadMore).toHaveBeenCalled();
            // A spinner while they load
            expect(
                screen.getByRole('listbox').querySelector('[role="progressbar"]'),
            ).not.toBeNull();
        });

        it('shows its items without IntersectionObserver', async () => {
            vi.stubGlobal('IntersectionObserver', undefined);
            const onLoadMore = vi.fn();
            render(
                <PanneauRoot>
                    <ComboBox label="Author" items={AUTHORS} onLoadMore={onLoadMore} />
                </PanneauRoot>,
            );
            await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
            expect(await screen.findAllByRole('option')).toHaveLength(2);
            expect(onLoadMore).not.toHaveBeenCalled();
        });
    });
});
