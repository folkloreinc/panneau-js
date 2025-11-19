import type { Item } from '@panneau/core/types';

interface ParseItemOptions {
    getItemLabel?: ((item: Item, path: string | string[]) => unknown) | null;
    itemLabelPath?: string | string[] | null;
    getItemDescription?: ((item: Item, path: string | string[]) => unknown) | null;
    itemDescriptionPath?: string | string[] | null;
}

interface ParsedOption {
    value: string;
    label: string | null;
}

const parseItemOption = (it: Item, options: ParseItemOptions): ParsedOption => {
    const {
        getItemLabel = null,
        itemLabelPath = null,
        getItemDescription = null,
        itemDescriptionPath = null,
    } = options;

    const label =
        getItemLabel !== null && itemLabelPath !== null ? getItemLabel(it, itemLabelPath) : null;
    const description =
        getItemDescription !== null && itemDescriptionPath !== null
            ? getItemDescription(it, itemDescriptionPath)
            : null;
    const finalLabel = description !== null ? `${label}: ${description}` : (label as string | null);
    return {
        value: it.id,
        label: finalLabel,
    };
};

export default parseItemOption;
