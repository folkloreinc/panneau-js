import type { Field, ResourceType } from '@panneau/core';

import { localized } from './utils';

/**
 * Block types used by the "items" field (ex: the blocks of a page).
 * Each type has its own fields; the item value gets a `type` key with the type id.
 */

const headingBlock: ResourceType = {
    id: 'heading',
    name: 'Titre',
    fields: [
        localized({ name: 'title', label: 'Titre', component: 'text', required: true }),
        {
            name: 'size',
            label: 'Taille',
            component: 'radios',
            defaultValue: 'medium',
            options: [
                { value: 'small', label: 'Petit' },
                { value: 'medium', label: 'Moyen' },
                { value: 'large', label: 'Grand' },
            ],
        },
    ],
};

const textBlock: ResourceType = {
    id: 'text',
    name: 'Texte',
    fields: [localized({ name: 'body', label: 'Texte', component: 'html' })],
};

const imageBlock: ResourceType = {
    id: 'image',
    name: 'Image',
    fields: [
        { name: 'image', label: 'Image', component: 'image', withFind: true },
        localized({ name: 'caption', label: 'Légende', component: 'text' }),
    ],
};

const galleryBlock: ResourceType = {
    id: 'gallery',
    name: 'Galerie',
    fields: [
        { name: 'images', label: 'Images', component: 'images', withFind: true },
        {
            name: 'columns',
            label: 'Colonnes',
            component: 'select',
            defaultValue: 3,
            options: [
                { value: 2, label: '2 colonnes' },
                { value: 3, label: '3 colonnes' },
                { value: 4, label: '4 colonnes' },
            ],
        },
    ],
};

const quoteBlock: ResourceType = {
    id: 'quote',
    name: 'Citation',
    fields: [
        localized({ name: 'body', label: 'Citation', component: 'textarea' }),
        { name: 'author', label: 'Auteur', component: 'text' },
    ],
};

const buttonBlock: ResourceType = {
    id: 'button',
    name: 'Bouton',
    fields: [
        localized({ name: 'label', label: 'Libellé', component: 'text', required: true }),
        { name: 'url', label: 'Lien', component: 'url' },
        {
            name: 'theme',
            label: 'Style',
            component: 'radios',
            defaultValue: 'primary',
            options: [
                { value: 'primary', label: 'Principal' },
                { value: 'secondary', label: 'Secondaire' },
            ],
        },
    ],
};

const embedBlock: ResourceType = {
    id: 'embed',
    name: 'Vidéo (YouTube, Vimeo...)',
    fields: [{ name: 'embed', label: 'URL de la vidéo', component: 'embed' }],
};

const contentBlocks = [
    headingBlock,
    textBlock,
    imageBlock,
    galleryBlock,
    quoteBlock,
    buttonBlock,
    embedBlock,
];

/**
 * A block containing other blocks (one level of nesting)
 */
const columnsBlock: ResourceType = {
    id: 'columns',
    name: 'Colonnes',
    fields: [
        {
            name: 'blocks',
            label: 'Blocs',
            component: 'items',
            withoutFormGroup: true,
            addItemLabel: 'Ajouter un bloc',
            noItemLabel: 'Aucun bloc',
            itemLabel: 'Bloc',
            types: contentBlocks,
        } as Field,
    ],
};

export const blockTypes: ResourceType[] = [...contentBlocks, columnsBlock];

/**
 * Field to add to a resource to edit its blocks
 */
export function blocksField(props: Partial<Field> = {}): Field {
    return {
        name: 'blocks',
        label: 'Blocs',
        type: 'array',
        component: 'items',
        withoutFormGroup: true,
        addItemLabel: 'Ajouter un bloc',
        noItemLabel: 'Aucun bloc pour le moment',
        itemLabel: 'Bloc',
        types: blockTypes,
        ...props,
    };
}

export default blockTypes;
