import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import type { DisplayEntry } from '../types';
import { TelDisplay } from './TelDisplay';
import {
    AddressDisplay,
    BooleanDisplay,
    ColorDisplay,
    CountryDisplay,
    DateDisplay,
    DateRangeDisplay,
    DateTimeDisplay,
    DurationDisplay,
    EmailDisplay,
    EmbedDisplay,
    EmptyValue,
    FileDisplay,
    JsonDisplay,
    LinkDisplay,
    LocationDisplay,
    MediaDisplay,
    MoneyDisplay,
    NumberDisplay,
    RegionDisplay,
    RelationDisplay,
    RichTextDisplay,
    SelectDisplay,
    TagsDisplay,
    TextDisplay,
    TimeDisplay,
    UrlDisplay,
} from './displays';

/** An image drawn in place: stories don't fetch images. */
function picture(hue: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="hsl(${String(hue)} 60% 70%)"/><circle cx="2" cy="1.3" r="0.7" fill="hsl(${String(hue)} 40% 40%)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface Entry {
    name: string;
    Display: DisplayEntry;
    value: unknown;
    field?: Field;
}

const entries: Entry[] = [
    { name: 'TextDisplay', Display: TextDisplay, value: 'The river festival returns' },
    { name: 'NumberDisplay', Display: NumberDisplay, value: 12345.5 },
    { name: 'BooleanDisplay', Display: BooleanDisplay, value: true },
    { name: 'DateDisplay', Display: DateDisplay, value: '2026-10-15' },
    { name: 'DateTimeDisplay', Display: DateTimeDisplay, value: '2026-10-15T13:30:00' },
    { name: 'TimeDisplay', Display: TimeDisplay, value: '14:30' },
    {
        name: 'DateRangeDisplay',
        Display: DateRangeDisplay,
        value: { start: '2026-11-04', end: '2026-11-06' },
    },
    {
        name: 'DurationDisplay',
        Display: DurationDisplay,
        value: 90,
        field: { name: 'length', type: 'duration', settings: { unit: 'minutes' } },
    },
    {
        name: 'SelectDisplay',
        Display: SelectDisplay,
        value: 'published',
        field: {
            name: 'status',
            type: 'select',
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published', tone: 'success' },
            ],
        },
    },
    {
        name: 'RelationDisplay',
        Display: RelationDisplay,
        value: [
            { id: '1', label: 'Ada Lovelace' },
            { id: '2', label: 'Grace Hopper' },
        ],
    },
    { name: 'UrlDisplay', Display: UrlDisplay, value: 'https://example.com/festival' },
    { name: 'EmailDisplay', Display: EmailDisplay, value: 'news@example.com' },
    { name: 'TelDisplay', Display: TelDisplay, value: '+15145550199' },
    {
        name: 'ColorDisplay',
        Display: ColorDisplay,
        value: 'purple',
        field: {
            name: 'background',
            type: 'color',
            settings: { palette: [{ value: 'purple', label: 'Purple', color: '#6b21a8' }] },
        },
    },
    { name: 'CountryDisplay', Display: CountryDisplay, value: 'CA' },
    {
        name: 'RegionDisplay',
        Display: RegionDisplay,
        value: 'QC',
        field: { name: 'province', type: 'region', settings: { country: 'CA' } },
    },
    {
        name: 'AddressDisplay',
        Display: AddressDisplay,
        value: {
            street: '1234 Rue Saint-Denis',
            city: 'Montréal',
            region: 'QC',
            postalCode: 'H2X 3J8',
            country: 'CA',
        },
    },
    {
        name: 'LinkDisplay',
        Display: LinkDisplay,
        value: {
            type: 'url',
            url: 'https://example.com/tickets',
            label: { en: 'Tickets', fr: 'Billets' },
            newTab: true,
        },
    },
    {
        name: 'LocationDisplay',
        Display: LocationDisplay,
        value: { lat: 45.501689, lng: -73.567256 },
    },
    { name: 'MoneyDisplay', Display: MoneyDisplay, value: { amount: 125000, currency: 'CAD' } },
    {
        name: 'TagsDisplay',
        Display: TagsDisplay,
        value: ['food', 'montréal'],
        field: { name: 'topics', type: 'tags', options: [{ value: 'food', label: 'Food' }] },
    },
    {
        name: 'MediaDisplay',
        Display: MediaDisplay,
        value: {
            id: 'med_1',
            label: 'Harbour at dawn',
            media: { type: 'image', url: picture(200), thumbnailUrl: picture(200) },
        },
    },
    {
        name: 'FileDisplay',
        Display: FileDisplay,
        value: [
            { name: 'poster.svg', url: picture(30), mime: 'image/svg+xml' },
            { name: 'report.pdf', url: '/report.pdf', mime: 'application/pdf' },
        ],
    },
    {
        name: 'EmbedDisplay',
        Display: EmbedDisplay,
        value: {
            url: 'https://video.example.com/abc',
            title: 'The festival in one minute',
            thumbnailUrl: picture(120),
        },
    },
    { name: 'JsonDisplay', Display: JsonDisplay, value: { stage: 'main', capacity: 1200 } },
    {
        name: 'RichTextDisplay',
        Display: RichTextDisplay,
        value: '<p>Three days of <strong>music</strong> by the water.</p>',
    },
];

/** Each display, by name, with its value, in a list of terms. */
function DisplayList({ values }: { values: 'filled' | 'empty' }) {
    return (
        <dl
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(10rem, max-content) 1fr',
                gap: '0.5rem 1.5rem',
                margin: 0,
            }}
        >
            {entries.map(({ name, Display, value, field }) => (
                <div key={name} style={{ display: 'contents' }}>
                    <dt>{name}</dt>
                    <dd style={{ margin: 0 }} data-display={name}>
                        <Display
                            value={values === 'filled' ? value : null}
                            item={{ id: '1' }}
                            column={{ id: 'value', label: name }}
                            field={field ?? null}
                        />
                    </dd>
                </div>
            ))}
            <div style={{ display: 'contents' }}>
                <dt>EmptyValue</dt>
                <dd style={{ margin: 0 }} data-display="EmptyValue">
                    <EmptyValue />
                </dd>
            </div>
        </dl>
    );
}

/** The built-in displays of the lists: how each shows a value in a cell or the details of an item. */
const meta = {
    title: 'Lists/Displays',
    component: DisplayList,
    parameters: { layout: 'padded' },
    args: { values: 'filled' },
} satisfies Meta<typeof DisplayList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The value of a display, by its name. */
function valueOf(canvasElement: HTMLElement, name: string): HTMLElement {
    const value = canvasElement.querySelector<HTMLElement>(`[data-display="${name}"]`);
    if (value === null) {
        throw new Error(`No value for ${name}`);
    }
    return value;
}

/** Every display with a realistic value. */
export const Values: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('term')).toHaveLength(entries.length + 1);
        const value = (name: string) => valueOf(canvasElement, name);
        await expect(value('NumberDisplay')).toHaveTextContent('12,345.5');
        await expect(
            within(value('BooleanDisplay')).getByRole('img', { name: 'Yes' }),
        ).toBeVisible();
        await expect(value('DateDisplay')).toHaveTextContent('Oct 15, 2026');
        await expect(value('DateDisplay').querySelector('time')).toHaveAttribute(
            'dateTime',
            '2026-10-15',
        );
        await expect(value('TimeDisplay')).toHaveTextContent('2:30 PM');
        await expect(value('DateRangeDisplay')).toHaveTextContent('Nov 4 – 6, 2026');
        await expect(value('DurationDisplay')).toHaveTextContent('1 h 30 min');
        await expect(value('SelectDisplay').querySelector('.panneau-badge')).toHaveClass(
            'panneau-tone-success',
        );
        await expect(value('RelationDisplay')).toHaveTextContent('Ada Lovelace, Grace Hopper');
        await expect(canvas.getByRole('link', { name: 'example.com/festival' })).toHaveAttribute(
            'href',
            'https://example.com/festival',
        );
        await expect(canvas.getByRole('link', { name: 'news@example.com' })).toHaveAttribute(
            'href',
            'mailto:news@example.com',
        );
        await expect(value('TelDisplay').querySelector('a')).toHaveAttribute(
            'href',
            'tel:+15145550199',
        );
        await expect(value('TelDisplay')).toHaveTextContent('+1 514 555 0199');
        await expect(value('ColorDisplay')).toHaveTextContent('Purple');
        await expect(value('CountryDisplay')).toHaveTextContent('Canada');
        await expect(value('RegionDisplay')).toHaveTextContent('Quebec');
        await expect(value('AddressDisplay')).toHaveTextContent(
            '1234 Rue Saint-Denis, Montréal, QC H2X 3J8',
        );
        const tickets = within(value('LinkDisplay')).getByRole('link', { name: 'Tickets' });
        await expect(tickets).toHaveAttribute('href', 'https://example.com/tickets');
        await expect(tickets).toHaveAttribute('target', '_blank');
        await expect(value('LocationDisplay')).toHaveTextContent('45.50169, -73.56726');
        await expect(value('MoneyDisplay').textContent).toMatch(/^CA\$1,250\.00$/);
        await expect(value('TagsDisplay')).toHaveTextContent('Foodmontréal');
        await expect(value('MediaDisplay').querySelector('img')).toHaveAttribute('alt', '');
        await expect(value('MediaDisplay')).toHaveTextContent('Harbour at dawn');
        await expect(canvas.getByRole('link', { name: 'report.pdf' })).toHaveAttribute(
            'href',
            '/report.pdf',
        );
        await expect(
            canvas.getByRole('link', { name: 'The festival in one minute' }),
        ).toHaveAttribute('href', 'https://video.example.com/abc');
        await expect(value('JsonDisplay')).toHaveTextContent('{"stage":"main","capacity":1200}');
        await expect(value('RichTextDisplay')).toHaveTextContent(
            'Three days of music by the water.',
        );
        // The flag of Quebec, decorative: its name describes it
        await waitFor(() =>
            expect(value('RegionDisplay').querySelector('img')).toHaveAttribute('alt', ''),
        );
    },
};

/** Without a value, every display shows a dash, hidden from assistive technologies. */
export const EmptyValues: Story = {
    args: { values: 'empty' },
    play: async ({ canvasElement }) => {
        const values = canvasElement.querySelectorAll('dd');
        await expect(values).toHaveLength(entries.length + 1);
        for (const value of values) {
            await expect(value).toHaveTextContent(/^—$/);
            await expect(value.firstElementChild).toHaveAttribute('aria-hidden', 'true');
        }
    },
};
