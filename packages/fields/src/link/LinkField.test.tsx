import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { FieldBinding, FieldsProviderProps } from '../shared/context';
import type { RelationSource } from '../shared/relation';
import { LinkField } from './LinkField';
import { cleanLink, getLinkText } from './link';

function renderLink(
    field: Partial<Field> = {},
    options: { initial?: unknown } & Omit<FieldsProviderProps, 'children'> = {},
) {
    const { initial, ...provider } = options;
    const onChange = vi.fn();
    renderField(
        <Controlled<unknown> initial={initial ?? null} onChange={onChange}>
            {(value, setValue) => (
                <DefinitionField
                    field={{ name: 'cta', type: 'link', label: 'Button', ...field }}
                    path="cta"
                    value={value}
                    onChange={setValue}
                />
            )}
        </Controlled>,
        provider,
    );
    return onChange;
}

describe('links', () => {
    it('show their label, their page or their URL', () => {
        expect(
            getLinkText(
                { type: 'url', url: 'https://example.com/', label: { fr: 'Site' } },
                'fr-CA',
            ),
        ).toBe('Site');
        expect(
            getLinkText({ type: 'url', url: 'https://example.com/', label: { en: 'Site' } }, 'fr'),
        ).toBe('Site');
        expect(getLinkText({ type: 'page', page: { id: '12', label: 'About' } })).toBe('About');
        expect(getLinkText({ type: 'email', url: 'mailto:info@example.com' })).toBe(
            'info@example.com',
        );
        expect(getLinkText({ type: 'url', url: 'https://example.com/' })).toBe('example.com');
    });

    it('keep the parts of their type only', () => {
        const options = { newTab: 'external' as const, defaultType: 'url' };
        expect(
            cleanLink(
                { type: 'page', url: 'https://x.test', page: '12', label: { fr: '' } },
                options,
            ),
        ).toEqual({ type: 'page', page: '12', newTab: false });
        expect(cleanLink({ type: 'url', url: '' }, options)).toBeNull();
        expect(cleanLink({ type: 'email' }, options)).toEqual({ type: 'email', newTab: false });
    });
});

describe('LinkField', () => {
    it('takes a URL, a label per locale, and a new tab', async () => {
        const onChange = renderLink({}, { locales: ['fr', 'en'] });
        expect(screen.getByRole('radio', { name: 'URL' })).toBeChecked();
        await userEvent.type(screen.getByRole('textbox', { name: /^URL/ }), 'https://example.com');
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'url',
            url: 'https://example.com',
            newTab: false,
        });
        await userEvent.type(screen.getByRole('textbox', { name: /Label \(French\)/ }), 'Billets');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Open in a new tab' }));
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'url',
            url: 'https://example.com',
            label: { fr: 'Billets' },
            newTab: true,
        });
    });

    it('writes email addresses with mailto: and phone numbers with tel:', async () => {
        const onChange = renderLink();
        await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
        expect(onChange).toHaveBeenLastCalledWith({ type: 'email', newTab: false });
        const email = screen.getByRole('textbox', { name: /Email address/ });
        await userEvent.type(email, 'info@example.com');
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'email',
            url: 'mailto:info@example.com',
            newTab: false,
        });
        expect(email).toHaveValue('info@example.com');

        await userEvent.click(screen.getByRole('radio', { name: 'Phone' }));
        await userEvent.type(screen.getByRole('textbox', { name: /Phone number/ }), '+15145550199');
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'tel',
            url: 'tel:+15145550199',
            newTab: false,
        });
    });

    it('opens url links in a new tab by itself with newTab: external', async () => {
        const onChange = renderLink({ settings: { newTab: 'external' } });
        expect(screen.queryByRole('checkbox')).toBeNull();
        await userEvent.type(screen.getByRole('textbox', { name: /^URL/ }), 'https://a.test');
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'url',
            url: 'https://a.test',
            newTab: true,
        });
    });

    it('searches its page in every resource of the field', async () => {
        const source: RelationSource = {
            search: (resource, query) =>
                Promise.resolve(
                    query === ''
                        ? []
                        : resource === 'pages'
                          ? [{ id: '1', label: 'Programme' }]
                          : [{ id: '7', label: 'Projection' }],
                ),
        };
        const onChange = renderLink({ resource: ['pages', 'events'] }, { relationSource: source });
        expect(screen.getByRole('radio', { name: 'Page' })).toBeChecked();
        await userEvent.type(screen.getByRole('combobox', { name: /Page/ }), 'pro');
        await userEvent.click(await screen.findByRole('option', { name: 'Projection' }));
        await waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith({
                type: 'page',
                page: { id: '7', label: 'Projection', resource: 'events' },
                newTab: false,
            }),
        );
    });

    it('offers the types of the site, and keeps the label when the type changes', async () => {
        const onChange = renderLink(
            {
                settings: {
                    types: ['url', { id: 'anchor', label: 'Anchor', placeholder: '#section' }],
                    label: 'required',
                },
            },
            { initial: { type: 'url', url: 'https://a.test', label: { fr: 'Haut' } } },
        );
        await userEvent.click(screen.getByRole('radio', { name: 'Anchor' }));
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'anchor',
            label: { fr: 'Haut' },
            newTab: false,
        });
        const anchor = screen.getByRole('textbox', { name: /Anchor/ });
        expect(anchor).toHaveAttribute('placeholder', '#section');
        await userEvent.type(anchor, '#top');
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'anchor',
            url: '#top',
            label: { fr: 'Haut' },
            newTab: false,
        });
    });

    it('has a label per locale’s link in a localized field', async () => {
        const onChange = renderLink(
            { localized: true, settings: { label: 'required' } },
            { locales: ['fr', 'en'] },
        );
        const [label] = screen.getAllByRole('textbox', { name: /Label/ });
        if (label === undefined) {
            throw new Error('The link has no label.');
        }
        await userEvent.type(label, 'Billets');
        expect(onChange).toHaveBeenLastCalledWith({
            fr: { type: 'url', label: 'Billets', newTab: false },
        });
    });

    it('needs the media plugin for files', async () => {
        renderLink({ settings: { types: ['file'] } }, { initial: { type: 'file' } });
        expect(screen.queryByRole('radiogroup')).toBeNull();
        expect(screen.getByText(/needs a plugin for the “media” type/)).toBeInTheDocument();
    });

    it('shows the errors of each part, from the binding of its path', () => {
        const Binding: FieldBinding = ({ path, render }) =>
            render({
                value: null,
                onChange: () => undefined,
                errors: path === 'cta.url' ? ['Not an email address.'] : [],
            });
        renderField(
            <LinkField
                label="Button"
                path="cta"
                types={[{ id: 'email' }]}
                value={{ type: 'email', url: 'mailto:nope' }}
            />,
            { binding: Binding },
        );
        expect(screen.getByRole('textbox', { name: /Email address/ })).toHaveAccessibleDescription(
            'Not an email address.',
        );
    });
});
