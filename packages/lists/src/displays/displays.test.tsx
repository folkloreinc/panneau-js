import { screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { fr } from '@panneau/intl';
import type { Field } from '@panneau/protocol';

import { renderList } from '../__fixtures__/render';
import type { DisplayEntry } from '../types';
import { DurationDisplay, RegionDisplay, TelDisplay, builtInDisplays } from './displays';

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

    it('shows the value of a secret text field as dots', () => {
        const field: Field = { name: 'key', type: 'text', settings: { secret: true } };
        const cell = renderDisplay('text', 's3cr3t', field);
        expect(cell.textContent).not.toContain('s3cr3t');
        expect(screen.getByRole('img', { name: 'Hidden value' })).toBeInTheDocument();
        expect(renderDisplay('text', null, field).textContent).toBe('—');
    });

    it('shows the options of a select in their tone', () => {
        const field: Field = {
            name: 'status',
            type: 'select',
            options: [
                { value: 'failed', label: 'Failed', tone: 'danger' },
                { value: 'queued', label: 'Queued' },
            ],
        };
        const cell = renderDisplay('select', ['failed', 'queued'], field);
        const [failed, queued] = [...cell.querySelectorAll('.panneau-badge')];
        expect(failed).toHaveTextContent('Failed');
        expect(failed).toHaveClass('panneau-tone-danger');
        expect(queued).toHaveClass('panneau-tone-neutral');
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
        const palette: Field = {
            name: 'background',
            type: 'color',
            settings: { palette: [{ value: 'purple', label: 'Purple', color: '#6b21a8' }] },
        };
        const purple = renderDisplay('color', 'purple', palette);
        expect(purple.textContent).toBe('Purple');
        expect(purple.querySelector('[aria-hidden="true"]')).toHaveStyle({
            backgroundColor: '#6b21a8',
        });
        expect(renderDisplay('color', 'teal', palette).textContent).toBe('teal');
        const cell = renderDisplay('media', { id: '1', thumbnailUrl: '/a.jpg', name: 'a.jpg' });
        expect(cell.querySelector('img')).toHaveAttribute('src', '/a.jpg');
        expect(cell).toHaveTextContent('a.jpg');
    });

    it('shows E.164 numbers with their flags in their international format', () => {
        const cell = renderDisplay('tel', '+15145550199');
        expect(cell.querySelector('a')).toHaveAttribute('href', 'tel:+15145550199');
        expect(cell).toHaveTextContent('🇨🇦+1 514 555 0199');
        expect(screen.getByText('🇨🇦')).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows the extension of a number, when its field allows one', () => {
        const field: Field = { name: 'phone', type: 'tel', settings: { extension: true } };
        const cell = renderDisplay('tel', '+15145550199;ext=123', field);
        expect(cell.querySelector('a')).toHaveAttribute('href', 'tel:+15145550199;ext=123');
        expect(cell).toHaveTextContent('🇨🇦+1 514 555 0199, ext. 123');
        expect(renderDisplay('tel', '+15145550199;ext=123')).toHaveTextContent(
            '+1 514 555 0199, ext. 123',
        );
        expect(renderDisplay('tel', '+15145550199', field)).toHaveTextContent('+1 514 555 0199');
        // A field without the setting shows the value as it is.
        expect(
            renderDisplay('tel', '+15145550199;ext=123', { name: 'phone', type: 'tel' })
                .textContent,
        ).toBe('+15145550199;ext=123');
        renderList(
            <div data-testid="cell">
                <TelDisplay
                    value="+15145550199;ext=123"
                    item={{ id: '1' }}
                    column={{ id: 'phone' }}
                    field={field}
                />
            </div>,
            { locale: 'fr', messages: fr },
        );
        expect(screen.getAllByTestId('cell').at(-1)).toHaveTextContent(
            '+1 514 555 0199, poste 123',
        );
    });

    it('shows countries with their flags, and regions by their names', () => {
        const country = renderDisplay('country', 'CA');
        expect(country).toHaveTextContent('🇨🇦Canada');
        expect(renderDisplay('country', 'Kanada')).toHaveTextContent('Kanada');
        expect(renderDisplay('country', ['FR', 'CA'])).toHaveTextContent('🇫🇷France🇨🇦Canada');
        expect(renderDisplay('country', []).textContent).toBe('—');
        expect(
            renderDisplay('region', 'QC', {
                name: 'province',
                type: 'region',
                settings: { country: 'CA' },
            }),
        ).toHaveTextContent('Quebec');
        renderList(
            <div data-testid="cell">
                <RegionDisplay
                    value="CA"
                    item={{ id: '1', country: 'US' }}
                    column={{ id: 'state' }}
                    field={{ name: 'state', type: 'region', from: 'country' }}
                />
            </div>,
        );
        expect(screen.getAllByTestId('cell').at(-1)).toHaveTextContent('California');
        expect(renderDisplay('region', 'Bavaria')).toHaveTextContent('Bavaria');
    });

    it('shows the flags of the regions that have one, as decorative images', async () => {
        const province = renderDisplay('region', 'QC', {
            name: 'province',
            type: 'region',
            settings: { country: 'CA' },
        });
        await waitFor(() => expect(province.querySelector('img')).toHaveAttribute('alt', ''));
        expect(province).toHaveTextContent('Quebec');
        const state = renderDisplay('region', 'JAL', {
            name: 'state',
            type: 'region',
            settings: { country: 'MX' },
        });
        expect(state).toHaveTextContent('Jalisco');
        expect(state.querySelector('img')).toBeNull();
    });

    it('shows durations in the unit of their field, with days', () => {
        const field = (settings: Record<string, unknown>): Field => ({
            name: 'duration',
            type: 'duration',
            settings,
        });
        // 52 hours in hours, to the hour, with days
        expect(
            renderDisplay('duration', 52, field({ unit: 'hours', largestUnit: 'days' }))
                .textContent,
        ).toBe('2 d 4 h');
        // Without days, the hours have no bound
        expect(renderDisplay('duration', 52, field({ unit: 'hours' })).textContent).toBe('52 h');
        // 90 minutes in minutes
        expect(renderDisplay('duration', 90, field({ unit: 'minutes' })).textContent).toBe(
            '1 h 30 min',
        );
        expect(renderDisplay('duration', 0, field({ unit: 'days' })).textContent).toBe('0 d');
        // A precision of hours rounds 1 h 40 min
        expect(
            renderDisplay('duration', 100, field({ unit: 'minutes', precision: 'hours' }))
                .textContent,
        ).toBe('2 h');
        // An unknown unit is ignored: seconds
        expect(renderDisplay('duration', 90, field({ unit: 'weeks' })).textContent).toBe(
            '1 min 30 s',
        );
        renderList(
            <div data-testid="cell">
                <DurationDisplay
                    value={30}
                    item={{ id: '1' }}
                    column={{ id: 'value' }}
                    field={field({ unit: 'days', largestUnit: 'days' })}
                />
            </div>,
            { locale: 'fr', messages: fr },
        );
        expect(screen.getAllByTestId('cell').at(-1)).toHaveTextContent('30 j');
    });

    it('shows addresses on one line, after the flag of their country', () => {
        const cell = renderDisplay('address', {
            street: '1234 Rue Saint-Denis',
            city: 'Montréal',
            region: 'QC',
            postalCode: 'H2X 3J8',
            country: 'CA',
        });
        expect(cell.textContent).toBe('🇨🇦1234 Rue Saint-Denis, Montréal, QC H2X 3J8');
        expect(renderDisplay('address', { country: 'FR' }).textContent).toBe('🇫🇷France');
        expect(renderDisplay('address', {}).textContent).toBe('—');
    });

    it('shows links by their label, page or URL, linked when they have a URL', () => {
        const cell = renderDisplay('link', {
            type: 'url',
            url: 'https://example.com/tickets',
            label: { en: 'Tickets', fr: 'Billets' },
            newTab: true,
        });
        const link = cell.querySelector('a');
        expect(link).toHaveTextContent('Tickets');
        expect(link).toHaveAttribute('href', 'https://example.com/tickets');
        expect(link).toHaveAttribute('target', '_blank');
        expect(
            renderDisplay('link', { type: 'email', url: 'mailto:info@example.com' }).querySelector(
                'a',
            ),
        ).toHaveTextContent('info@example.com');
        const page = renderDisplay('link', { type: 'page', page: { id: '2', label: 'About' } });
        expect(page.querySelector('a')).toBeNull();
        expect(page).toHaveTextContent('About');
        expect(renderDisplay('link', { url: 'https://x.test' }).textContent).toBe('—');
    });

    it('shows date ranges in the format of the locale, open at one end or not', () => {
        expect(
            renderDisplay('daterange', { start: '2026-11-04', end: '2026-11-06' }),
        ).toHaveTextContent('Nov 4 – 6, 2026');
        expect(renderDisplay('daterange', { start: '2026-11-04', end: null })).toHaveTextContent(
            'From Nov 4, 2026',
        );
        expect(renderDisplay('daterange', { start: null, end: '2026-12-01' })).toHaveTextContent(
            'Until Dec 1, 2026',
        );
        expect(
            renderDisplay(
                'daterange',
                { start: '2026-11-05T00:30:00Z', end: '2026-11-05T02:00:00Z' },
                {
                    name: 'dates',
                    type: 'daterange',
                    settings: { time: true, timeZone: 'America/Toronto' },
                },
            ).textContent?.replace(/\s/g, ' '),
        ).toMatch(/^Nov 4, 2026, 7:30 – 9:00 PM/);
        expect(renderDisplay('daterange', null)).toHaveTextContent('—');
    });

    it('shows money in the currency format of the locale', () => {
        expect(renderDisplay('money', { amount: 125000, currency: 'CAD' }).textContent).toMatch(
            /^CA\$1,250\.00$/,
        );
        expect(renderDisplay('money', { amount: 1250, currency: 'JPY' })).toHaveTextContent(
            '¥1,250',
        );
        expect(renderDisplay('money', 1250)).toHaveTextContent('—');
    });

    it('shows phone numbers, durations, JSON and tags', () => {
        expect(renderDisplay('tel', '514 555-0199').querySelector('a')).toHaveAttribute(
            'href',
            'tel:5145550199',
        );
        expect(renderDisplay('duration', 3930).textContent).toBe('1 h 5 min 30 s');
        expect(
            renderDisplay('duration', 180, {
                name: 'reading_time',
                type: 'duration',
                settings: { precision: 'minutes' },
            }).textContent,
        ).toBe('3 min');
        expect(renderDisplay('json', { a: 1 }).textContent).toBe('{"a":1}');
        expect(renderDisplay('json', { text: 'x'.repeat(100) }).textContent).toHaveLength(80);
        expect(
            renderDisplay('tags', ['food', 'montréal'], {
                name: 'topics',
                type: 'tags',
                options: [{ value: 'food', label: 'Food' }],
            }).textContent,
        ).toBe('Foodmontréal');
        expect(renderDisplay('range', 7.5).textContent).toBe('7.5');
    });

    it('shows embeds and places', () => {
        const embed = renderDisplay('embed', {
            url: 'https://youtu.be/abc',
            title: 'A video',
            thumbnailUrl: 'https://i.ytimg.com/vi/abc/hqdefault.jpg',
        });
        expect(embed.querySelector('a')).toHaveAttribute('href', 'https://youtu.be/abc');
        expect(embed.textContent).toBe('A video');
        expect(renderDisplay('embed', { url: 'https://example.com/a' }).textContent).toBe(
            'example.com/a',
        );
        expect(
            renderDisplay('location', { lat: 45.5, lng: -73.56, address: 'Montréal' }).textContent,
        ).toBe('Montréal');
        expect(renderDisplay('location', { lat: 45.501689, lng: -73.567256 }).textContent).toBe(
            '45.50169, -73.56726',
        );
    });
});
