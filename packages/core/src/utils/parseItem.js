const parseItemOption = (
    it,
    {
        getItemLabel = null,
        itemLabelPath = null,
        getItemDescription = null,
        itemDescriptionPath = null,
    },
) => {
    const label =
        getItemLabel !== null && itemLabelPath !== null ? getItemLabel(it, itemLabelPath) : null;
    const description =
        getItemDescription !== null && itemDescriptionPath !== null
            ? getItemDescription(it, itemDescriptionPath)
            : null;
    const finalLabel = description !== null ? `${label}: ${description}` : label;
    return {
        value: it.id,
        label: finalLabel,
    };
};

export default parseItemOption;
