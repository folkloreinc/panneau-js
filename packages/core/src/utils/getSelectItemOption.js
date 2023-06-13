import getItemLabel from './getItemLabel';
import getPathValue from './getPathValue';

// import parseItem from './parseItem';

const getSelectItemOption = (item, options) => {
    const {
        getItemLabel: initialGetItemLabel = getPathValue,
        getItemDescription = getPathValue,
        // getItemImage = getPathValue,
        itemLabelPath,
        itemDescriptionPath,
        // itemImagePath,
        itemLabelWithId,
    } = options || {};

    const parseItem = (it) => {
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
