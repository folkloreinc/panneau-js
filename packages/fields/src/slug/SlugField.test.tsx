import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { SlugField, slugify } from './SlugField';

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
});
