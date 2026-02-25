type Value = Record<string, unknown> | unknown[] | null;

function setValue(value: Value, keyParts: string[], fieldValue: unknown): Value {
    const key = keyParts.shift();
    if (!key) {
        return value;
    }
    const isArray = key.match(/^[0-9]+$/) !== null;
    if (value !== null || fieldValue !== null) {
        if (isArray) {
            const index = parseInt(key, 10);
            const arrayValue = value as unknown[];
            const newArrayValue =
                fieldValue !== null
                    ? [
                          ...arrayValue.slice(0, index),
                          keyParts.length > 0
                              ? setValue(
                                    arrayValue !== null ? arrayValue[index] || null : null,
                                    keyParts,
                                    fieldValue,
                                )
                              : fieldValue,
                          ...arrayValue.slice(index + 1),
                      ]
                    : [...arrayValue.slice(0, index), ...arrayValue.slice(index + 1)];
            return newArrayValue.length > 0 ? newArrayValue : null;
        }
        const objectValue = value as Record<string, unknown>;
        return {
            ...objectValue,
            [key]:
                keyParts.length > 0
                    ? setValue(
                          objectValue !== null ? objectValue[key] || null : null,
                          keyParts,
                          fieldValue,
                      )
                    : fieldValue,
        };
    }
    return null;
}

export default setValue;
