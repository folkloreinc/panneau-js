/**
 * Forms as products build them, at the width the app gives them: how fields share the space with
 * and without a layout, and how localized fields show one locale at a time.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Field, LayoutNode } from '@panneau/protocol';

import { Form, type FormProps } from '../Form';

const ORDER_FIELDS: Field[] = [
    { name: 'product', type: 'text', label: 'Product', readOnly: true },
    { name: 'quantity', type: 'number', label: 'Quantity', readOnly: true },
    {
        name: 'store',
        type: 'select',
        label: 'Pickup store',
        options: [
            { value: 'downtown', label: 'Downtown' },
            { value: 'harbour', label: 'Harbour' },
        ],
    },
    {
        name: 'contact',
        type: 'group',
        label: 'Contact',
        readOnly: true,
        fields: [
            { name: 'name', type: 'text', label: 'Name' },
            { name: 'phone', type: 'tel', label: 'Phone' },
            { name: 'email', type: 'email', label: 'Email' },
        ],
    },
    {
        name: 'address',
        type: 'group',
        label: 'Address',
        readOnly: true,
        fields: [
            { name: 'street', type: 'text', label: 'Street' },
            { name: 'city', type: 'text', label: 'City' },
            { name: 'province', type: 'text', label: 'Province' },
            { name: 'postal_code', type: 'text', label: 'Postal code' },
            { name: 'country', type: 'text', label: 'Country' },
        ],
    },
    { name: 'notes', type: 'textarea', label: 'Notes' },
];

const ORDER_VALUES = {
    product: '2022 Pinot noir, Clos des Lunes',
    quantity: 6,
    store: 'harbour',
    contact: { name: 'Ada Lovelace', phone: '514 555-0100', email: 'ada@example.com' },
    address: {
        street: '1234 Main Street',
        city: 'Montréal',
        province: 'QC',
        postal_code: 'H2X 1Y4',
        country: 'Canada',
    },
};

const PAGE_FIELDS: Field[] = [
    { name: 'published', type: 'boolean', label: 'Published', settings: { widget: 'switch' } },
    {
        name: 'title',
        type: 'text',
        label: 'Title',
        localized: true,
        rules: [{ rule: 'required' }, { rule: 'max', value: 120 }],
    },
    { name: 'summary', type: 'textarea', label: 'Summary', localized: true },
    {
        name: 'template',
        type: 'select',
        label: 'Template',
        options: [
            { value: 'default', label: 'Default' },
            { value: 'landing', label: 'Landing page' },
        ],
    },
    { name: 'published_at', type: 'date', label: 'Publication date' },
];

const ARTICLE_FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    { name: 'subtitle', type: 'text', label: 'Subtitle' },
    { name: 'summary', type: 'textarea', label: 'Summary' },
    { name: 'author', type: 'text', label: 'Author' },
    { name: 'reading_time', type: 'number', label: 'Reading time (minutes)' },
    { name: 'meta_title', type: 'text', label: 'Meta title' },
    { name: 'meta_description', type: 'textarea', label: 'Meta description' },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
        ],
    },
    { name: 'published_at', type: 'date', label: 'Publication date' },
    { name: 'featured', type: 'boolean', label: 'Featured on the home page' },
];

const ARTICLE_LAYOUT: LayoutNode[] = [
    {
        type: 'row',
        children: [
            { type: 'field', name: 'title', width: 8 },
            { type: 'field', name: 'reading_time', width: 4 },
        ],
    },
    { type: 'field', name: 'subtitle' },
    { type: 'field', name: 'summary' },
    {
        type: 'section',
        label: 'Search engines',
        collapsible: true,
        children: [
            { type: 'field', name: 'meta_title' },
            { type: 'field', name: 'meta_description' },
        ],
    },
    {
        type: 'sidebar',
        label: 'Publication',
        children: [
            { type: 'field', name: 'status' },
            { type: 'field', name: 'published_at' },
            { type: 'field', name: 'featured' },
        ],
    },
];

/** The width the app gives a form page: 64rem, or 80rem with a sidebar. */
function Page({ width, children }: { width: string; children: ReactNode }) {
    return <div style={{ maxWidth: width, marginInline: 'auto' }}>{children}</div>;
}

interface LayoutExampleProps extends FormProps {
    /** The width of the page around the form. */
    width: string;
}

function LayoutExample({ width, ...props }: LayoutExampleProps) {
    return (
        <Page width={width}>
            <Form {...props} />
        </Page>
    );
}

const meta = {
    title: 'Forms/Layouts',
    component: LayoutExample,
    args: { width: '64rem', fields: [], onSubmit: fn(async () => undefined) },
} satisfies Meta<typeof LayoutExample>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The top of an element, to check which fields share a row. */
function top(element: Element): number {
    return element.getBoundingClientRect().top;
}

/** Whether two elements are on the same row: inputs of some types are a pixel taller. */
function sameRow(a: Element, b: Element): boolean {
    return Math.abs(top(a) - top(b)) < 4;
}

/**
 * A definition without a layout: short fields share a row, in as many columns as fit. Long
 * fields, groups and localized fields take a row of their own, and the fields of a group flow in
 * columns too.
 */
export const WithoutLayout: Story = {
    args: { fields: ORDER_FIELDS, values: ORDER_VALUES },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const product = canvas.getByRole('textbox', { name: 'Product' });
        await expect(sameRow(canvas.getByRole('textbox', { name: 'Quantity' }), product)).toBe(
            true,
        );
        const name = canvas.getByRole('textbox', { name: 'Name' });
        await expect(sameRow(canvas.getByRole('textbox', { name: 'Phone' }), name)).toBe(true);
        // A text area takes the whole row.
        const notes = canvas.getByRole('textbox', { name: 'Notes' });
        await expect(notes.getBoundingClientRect().width).toBeGreaterThan(
            product.getBoundingClientRect().width * 2,
        );
    },
};

/** The same form in a phone's width: one column. */
export const WithoutLayoutOnAPhone: Story = {
    args: { ...WithoutLayout.args, width: '22rem' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const product = canvas.getByRole('textbox', { name: 'Product' });
        await expect(top(canvas.getByRole('textbox', { name: 'Quantity' }))).toBeGreaterThan(
            top(product),
        );
    },
};

/**
 * Localized fields show one locale at a time, with a switch at the end of their label. An empty
 * locale of a field that isn't required is a translation to add (`+ FR`); a required one is marked
 * until it is filled, and one in error shows it.
 */
export const LocalizedFields: Story = {
    args: {
        fields: PAGE_FIELDS,
        locales: ['en', 'fr'],
        values: { published: true, title: { en: 'About us' }, summary: { en: 'Who we are.' } },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByRole('group', { name: 'Title' });
        await expect(within(title).getByRole('radio', { name: 'French, empty' })).toBeVisible();
        const summary = canvas.getByRole('group', { name: 'Summary' });
        await userEvent.click(
            within(summary).getByRole('radio', { name: 'Add a translation: French' }),
        );
        await userEvent.type(within(summary).getByRole('textbox', { name: 'French' }), 'Qui');
        await expect(within(summary).getByRole('radio', { name: 'French' })).toBeChecked();
        // Saving shows the French title, which is required.
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        const french = within(title).getByRole('textbox', { name: 'French' });
        await waitFor(() => expect(french).toHaveFocus());
        await expect(
            within(title).getByRole('radio', { name: 'French, has errors' }),
        ).toBeChecked();
    },
};

/**
 * A layout places its fields: rows with widths out of 12, sections, and a sidebar next to the main
 * column, whose panels collapse under their title (decision 0074). The app gives a form with a
 * sidebar the width of a list.
 */
export const RowsSectionsAndSidebar: Story = {
    args: {
        width: '80rem',
        fields: ARTICLE_FIELDS,
        layout: ARTICLE_LAYOUT,
        values: { status: 'draft' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByRole('textbox', { name: /Title/ });
        const readingTime = canvas.getByRole('textbox', { name: /Reading time/ });
        await expect(sameRow(readingTime, title)).toBe(true);
        const sidebar = canvas.getByRole('region', { name: 'Sidebar' });
        // Beside the form, in view as it scrolls
        await expect(getComputedStyle(sidebar).position).toBe('sticky');
        const publication = within(sidebar).getByRole('button', { name: 'Publication' });
        await expect(publication).toHaveAttribute('aria-expanded', 'true');
        await userEvent.click(publication);
        await expect(publication).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(publication);
    },
};
