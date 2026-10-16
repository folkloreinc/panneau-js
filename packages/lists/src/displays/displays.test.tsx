import { screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { renderList } from '../__fixtures__/render';
import type { DisplayEntry } from '../types';
import { builtInDisplays } from './displays';

function renderDisplay(display: string, value: unknown, field: Field | null = null): HTMLElement {
    const Display = builtInDisplays[display] as DisplayEntry;
    const element: ReactElement = (
        <div data-testid="cell">
            <Display value={value} item={{ id: '1' }} column={{ id: 'value' }} field={field} />
        </div>
    );
    renderList(element);
    // Some tests render several displays: the last one is the one just rendered.
    return screen.getAllByTestId('cell').at(-1) as HTMLElement;
}

describe('displays', () => {
    it('shows an empty value as a dash hidden from assistive technologies', () => {
        const cell = renderDisplay('text', null);
        expect(cell.textContent).toBe('—');
        expect(cell.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows text, rich text and numbers', () => {
        expect(renderDisplay('richtext', '<p>Hello <b>you</b></p>').textContent).toBe('Hello you');
        expect(renderDisplay('number', 12345.5).textContent).toBe('12,345.5');
    });

    it('shows booleans with a label', () => {
        renderDisplay('boolean', true);
        expect(screen.getByRole('img', { name: 'Yes' })).toBeInTheDocument();
    });

    it('shows a date as a local date, a date and time, and a time', () => {
        expect(renderDisplay('date', '2026-10-15').textContent).toBe('Oct 15, 2026');
        expect(renderDisplay('datetime', '2026-10-15T13:30:00').textContent).toMatch(
            /Oct 15, 2026/,
        );
        expect(renderDisplay('time', '14:30').textContent).toBe('2:30 PM');
    });

    it('shows the labels of options and of related items', () => {
        const field: Field = {
            name: 'tags',
            type: 'select',
            options: [{ value: 'a', label: 'Alpha' }],
        };
        expect(renderDisplay('select', ['a', 'b'], field).textContent).toBe('Alphab');
        expect(
            renderDisplay('relation', [
                { id: '1', label: 'Ada' },
                { id: '2', label: 'Grace' },
            ]).textContent,
        ).toBe('Ada, Grace');
    });

    it('links URLs and emails', () => {
        renderDisplay('url', 'https://example.com/a');
        expect(screen.getByRole('link', { name: 'example.com/a' })).toHaveAttribute(
            'href',
            'https://example.com/a',
        );
        renderDisplay('email', 'ada@example.com');
        expect(screen.getByRole('link', { name: 'ada@example.com' })).toHaveAttribute(
            'href',
            'mailto:ada@example.com',
        );
    });

    it('shows colors and media', () => {
        expect(renderDisplay('color', '#ff0000').textContent).toBe('#ff0000');
        const cell = renderDisplay('media', { id: '1', thumbnailUrl: '/a.jpg', name: 'a.jpg' });
        expect(cell.querySelector('img')).toHaveAttribute('src', '/a.jpg');
        expect(cell).toHaveTextContent('a.jpg');
    });
});
