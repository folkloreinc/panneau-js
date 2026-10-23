import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider } from '@panneau/core';
import type { Definition, Field, MediaReference } from '@panneau/protocol';

import { ImageField, MediaFieldEntry, getImageOptions } from './MediaField';
import { harbour, harbourBanner, hiker, referenceTo } from './__fixtures__/images';
import { createMemorySource, libraryMedia } from './__fixtures__/mediaSources';
import { Controlled, renderInRoot } from './__fixtures__/render';

const cover = referenceTo(harbour, 'med_h');

describe('ImageField', () => {
    it('edits the transform of an image for this use', async () => {
        const onChange = vi.fn();
        renderInRoot(
            <Controlled<MediaReference | null> initial={cover} onChange={onChange}>
                {(value, setValue) => (
                    <ImageField
                        label="Cover"
                        resource="media"
                        adapter={null}
                        sources={[]}
                        value={value}
                        onChange={setValue}
                        ratios={['16:9', '1:1']}
                        enforceRatios
                    />
                )}
            </Controlled>,
        );

        expect(screen.getByText('16:9 or 1:1')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Edit harbour at dawn' }));
        const editor = within(screen.getByRole('dialog', { name: 'Edit image' }));
        await userEvent.click(editor.getByRole('radio', { name: '1:1' }));
        await userEvent.click(editor.getByRole('button', { name: 'Apply' }));

        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                id: 'med_h',
                transform: { crop: { x: 500, y: 0, width: 3000, height: 3000 } },
            }),
        );
        expect(screen.getByText('Cropped for this use')).toBeInTheDocument();
    });

    it('opens the editor as the step after a pick when a crop is required', async () => {
        const onChange = vi.fn();
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        renderInRoot(
            <ImageField
                label="Cover"
                resource="media"
                adapter={null}
                sources={[media]}
                value={null}
                onChange={onChange}
                ratios={['16:9']}
                enforceRatios
                cropRequired
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Choose image' }));
        let picker = within(screen.getByRole('dialog', { name: 'Choose image' }));
        await userEvent.click(await picker.findByRole('row', { name: 'autumn forest' }));
        await userEvent.click(picker.getByRole('button', { name: 'Next: crop' }));

        let editor = within(await screen.findByRole('dialog', { name: 'Crop for this use' }));
        // Back to the library, and the same pick again.
        await userEvent.click(editor.getByRole('button', { name: 'Back to the library' }));
        picker = within(await screen.findByRole('dialog', { name: 'Choose image' }));
        await userEvent.click(await picker.findByRole('row', { name: 'autumn forest' }));
        await userEvent.click(picker.getByRole('button', { name: 'Next: crop' }));
        editor = within(await screen.findByRole('dialog', { name: 'Crop for this use' }));
        await userEvent.click(editor.getByRole('button', { name: 'Use this crop' }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'med_03',
                resource: 'media',
                transform: { crop: expect.objectContaining({ x: 0 }) },
            }),
        );
    });

    it('says which images need a crop, and which were made on a previous version', () => {
        renderInRoot(
            <ImageField
                label="Gallery"
                resource="media"
                multiple
                adapter={null}
                value={[
                    cover,
                    referenceTo(hiker, 'med_k', {
                        transform: {
                            base: 'media',
                            baseTransform: { rotate: 270 },
                            crop: { x: 0, y: 900, width: 3024, height: 1701 },
                        },
                    }),
                ]}
                cropRequired
            />,
        );

        expect(screen.getByText('Needs a crop')).toBeInTheDocument();
        expect(screen.getByText('Library version changed: check the crop')).toBeInTheDocument();
        // Each image can be edited for this use.
        expect(screen.getAllByRole('button', { name: /^Edit / })).toHaveLength(2);
    });

    it('edits one image of a gallery', async () => {
        const onChange = vi.fn();
        renderInRoot(
            <ImageField
                label="Gallery"
                resource="media"
                multiple
                adapter={null}
                value={[cover, referenceTo(harbour, 'med_2', { label: 'second harbour' })]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Edit second harbour' }));
        const editor = within(screen.getByRole('dialog', { name: 'Edit image' }));
        await userEvent.click(editor.getByRole('radio', { name: 'Rotate' }));
        await userEvent.click(editor.getByRole('button', { name: 'Rotate right' }));
        await userEvent.click(editor.getByRole('button', { name: 'Apply' }));

        expect(onChange).toHaveBeenCalledWith([
            cover,
            expect.objectContaining({ id: 'med_2', transform: { rotate: 90 } }),
        ]);
    });

    it('has no actions when it is read-only', () => {
        renderInRoot(
            <ImageField
                label="Cover"
                resource="media"
                readOnly
                adapter={null}
                value={referenceTo(harbour, 'med_h', { transform: harbourBanner })}
            />,
        );

        expect(screen.getByText('Cropped for this use')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});

describe('the image type', () => {
    it('reads its options and its crop rule', () => {
        const field: Field = {
            name: 'cover',
            type: 'image',
            ratios: ['4:3'],
            rotate: false,
            transformBase: 'choose',
        };
        expect(getImageOptions(field)).toEqual({
            ratios: ['4:3'],
            enforceRatios: false,
            cropRequired: false,
            rotate: false,
            focalPoint: true,
            transformBase: 'choose',
        });
        expect(
            getImageOptions({
                ...field,
                rules: [{ rule: 'crop', value: { ratios: ['16:9', '1:1'], required: true } }],
            }),
        ).toEqual(
            expect.objectContaining({
                ratios: ['16:9', '1:1'],
                enforceRatios: true,
                cropRequired: true,
            }),
        );
    });

    it('is an image field in a definition, with its constraints', () => {
        const definition = {
            resources: [
                {
                    id: 'media',
                    kind: 'media',
                    label: { singular: 'media', plural: 'media' },
                    fields: [{ name: 'file', type: 'file' }],
                },
            ],
        } as unknown as Definition;
        renderInRoot(
            <PanneauProvider definition={definition}>
                <MediaFieldEntry
                    field={{
                        name: 'cover',
                        type: 'image',
                        label: 'Cover',
                        rules: [{ rule: 'crop', value: { ratios: ['16:9'], required: true } }],
                    }}
                    path="cover"
                    value={cover}
                    onChange={vi.fn()}
                />
            </PanneauProvider>,
        );

        expect(screen.getByText('16:9')).toBeInTheDocument();
        expect(screen.getByText('Crop required')).toBeInTheDocument();
        expect(screen.getByText('Needs a crop')).toBeInTheDocument();
    });
});
