import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { FieldCheckSource } from '../shared/check';
import { SlugField, slugify, sourceText } from './SlugField';

describe('slugify', () => {
    it('makes URL slugs without accents', () => {
        expect(slugify('Été à Montréal !')).toBe('ete-a-montreal');
        expect(slugify('  --Hello__World-- ')).toBe('hello-world');
        expect(slugify('')).toBe('');
    });
});

describe('SlugField', () => {
    it('cleans up typed text on blur', async () => {
        const onChange = vi.fn();
        renderField(<SlugField label="Slug" value="Hello World" onChange={onChange} />);
        await userEvent.click(screen.getByRole('textbox'));
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('hello-world');
    });

    it('follows its source until it is edited', async () => {
        function Form() {
            return (
                <Controlled<{ title: string; slug: string | null }>
                    initial={{ title: '', slug: null }}
                >
                    {(values, setValues) => (
                        <>
                            <input
                                aria-label="Title"
                                value={values.title}
                                onChange={(event) =>
                                    setValues({ ...values, title: event.target.value })
                                }
                            />
                            <SlugField
                                label="Slug"
                                source={values.title}
                                sourceLabel="Title"
                                value={values.slug}
                                onChange={(slug) => setValues({ ...values, slug })}
                            />
                        </>
                    )}
                </Controlled>
            );
        }
        renderField(<Form />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Été');
        expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('ete');
        await userEvent.type(screen.getByRole('textbox', { name: 'Slug' }), '-x');
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), '!');
        expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('ete-x');
        await userEvent.click(screen.getByRole('button', { name: 'Generate from Title' }));
        expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('ete');
    });

    it('reads its source from the parent value', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'slug',
                    type: 'slug',
                    label: 'Slug',
                    from: 'title',
                    settings: { prefix: '/' },
                }}
                path="slug"
                value="ete"
                parentValue={{ title: { fr: 'Été', en: 'Summer' } }}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('button', { name: 'Generate from title' })).toBeDisabled();
        expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('follows its source in its own locale, or in the default one', () => {
        expect(sourceText({ fr: 'Été', en: 'Summer' }, 'en')).toBe('Summer');
        expect(sourceText({ fr: 'Été' }, 'en')).toBeNull();
        expect(sourceText({ en: 'Summer', fr: 'Été' })).toBe('Summer');

        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'slug',
                    type: 'slug',
                    label: 'Slug',
                    from: 'title',
                    localized: true,
                }}
                path="slug"
                value={{}}
                parentValue={{ title: { fr: 'Été', en: 'Summer' } }}
                onChange={onChange}
            />,
            { locales: ['fr', 'en'] },
        );
        // Both inputs have a source in their locale: generating fills each
        const buttons = screen.getAllByRole('button', { name: 'Generate from title' });
        expect(buttons).toHaveLength(2);
    });

    it('checks the slug with the backend, shows its URL and suggests a free one', async () => {
        const check = vi.fn<FieldCheckSource['check']>((_field, { value }) =>
            Promise.resolve(
                value === 'ete'
                    ? {
                          available: false,
                          suggestion: 'ete-2',
                          prefix: 'https://site.test/fr/',
                          url: null,
                      }
                    : {
                          available: true,
                          suggestion: null,
                          prefix: 'https://site.test/fr/',
                          url: `https://site.test/fr/${value}`,
                      },
            ),
        );
        const onChange = vi.fn();
        function Form() {
            return (
                <Controlled<string | null> initial="ete" onChange={onChange}>
                    {(value, setValue) => (
                        <DefinitionField
                            field={{ name: 'slug', type: 'slug', label: 'Slug', check: true }}
                            path="slug"
                            value={value}
                            parentValue={{ slug: value, parent: '7' }}
                            onChange={(next) => setValue(next as string | null)}
                        />
                    )}
                </Controlled>
            );
        }
        renderField(<Form />, { checkSource: { check } });

        expect(await screen.findByText('This slug is already used.')).toBeInTheDocument();
        expect(screen.getByText('https://site.test/fr/')).toBeInTheDocument();
        expect(check).toHaveBeenCalledWith(
            'slug',
            { value: 'ete', values: { slug: 'ete', parent: '7' } },
            expect.anything(),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Use ete-2' }));
        expect(onChange).toHaveBeenLastCalledWith('ete-2');
        expect(
            await screen.findByRole('link', { name: 'https://site.test/fr/ete-2' }),
        ).toHaveAttribute('href', 'https://site.test/fr/ete-2');
        expect(screen.queryByText('This slug is already used.')).not.toBeInTheDocument();
    });

    it('is read-only when the backend says the field does not apply', async () => {
        renderField(
            <DefinitionField
                field={{ name: 'slug', type: 'slug', label: 'Slug', check: true }}
                path="slug"
                value="home"
                onChange={() => undefined}
            />,
            {
                checkSource: {
                    check: () => Promise.resolve({ available: true, disabled: true }),
                },
            },
        );
        await waitFor(() => expect(screen.getByRole('textbox')).toHaveAttribute('readonly'));
    });

    it("doesn't check a slug inside a group or a block", async () => {
        const check = vi.fn<FieldCheckSource['check']>();
        renderField(
            <DefinitionField
                field={{ name: 'slug', type: 'slug', label: 'Slug', check: true }}
                path="blocks.0.slug"
                value="ete"
                onChange={() => undefined}
            />,
            { checkSource: { check } },
        );
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(check).not.toHaveBeenCalled();
    });
});
