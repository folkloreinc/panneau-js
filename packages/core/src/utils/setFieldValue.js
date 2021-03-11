const setValue = (value, keyParts, fieldValue) => {
    const key = keyParts.shift();
    const isArray = key.match(/^[0-9]+$/) !== null;
    if (value !== null || fieldValue !== null) {
        if (isArray) {
            const index = parseInt(key, 10);
            const newArrayValue =
                fieldValue !== null
                    ? [
                          ...value.slice(0, index),
                          keyParts.length > 0
                              ? setValue(
                                    value !== null ? value[index] || null : null,
                                    keyParts,
                                    fieldValue,
                                )
                              : fieldValue,
                          ...value.slice(index + 1),
                      ]
                    : [...value.slice(0, index), ...value.slice(index + 1)];
            return newArrayValue.length > 0 ? newArrayValue : null;
        }
        return {
            ...value,
            [key]:
                keyParts.length > 0
                    ? setValue(value !== null ? value[key] || null : null, keyParts, fieldValue)
                    : fieldValue,
        };
    }
    return null;
};

export default setValue;
