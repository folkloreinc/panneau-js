const getItemLabel = (it, path, getLabel, withId = false) => {
    const { id = null } = it || {};
    if (withId) {
        const label = getLabel(it, path);
        return label ? `${label} (#${id})` : `#${id}`;
    }
    return path !== null ? getLabel(it, path) : `#${id}`;
};

export default getItemLabel;
