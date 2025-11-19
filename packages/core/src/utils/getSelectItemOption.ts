import type { Item } from '@panneau/core/types';

import getItemLabel from './getItemLabel';
import getPathValue from './getPathValue';

interface SelectItemOptions {
    getItemLabel?: ((item: Item, path: string | string[]) => unknown) | null;
    getItemDescription?: ((item: Item, path: string | string[]) => unknown) | null;
    itemLabelPath?: string | string[] | null;
    itemDescriptionPath?: string | string[] | null;
    itemLabelWithId?: boolean;
}

interface SelectItemResult {
    value: string;
    label: unknown;
}

const getSelectItemOption = (item: Item, options: SelectItemOptions | null): SelectItemResult => {
    const {
        getItemLabel: initialGetItemLabel = getPathValue,
        getItemDescription = getPathValue,
        // getItemImage = getPathValue,
        itemLabelPath,
        itemDescriptionPath,
        // itemImagePath,
        itemLabelWithId,
    } = options || {};

    const parseItem = (it: Item): SelectItemResult => {
        const label = getItemLabel(it, itemLabelPath, initialGetItemLabel, itemLabelWithId);
        const description = getItemDescription(it, itemDescriptionPath);
        const finalLabel = description !== null ? `${label}: ${description}` : label;

        return {
            value: it.id,
            label: finalLabel,
        };
    };

    return parseItem(item);
};

export default getSelectItemOption;
