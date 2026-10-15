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
            const arrayValue = Array.isArray(value) ? value : [];
            let newArrayValue: unknown[];
            if (fieldValue !== null) {
                newArrayValue = [...arrayValue];
                // Pad with null so an out-of-range index lands at the right position
                while (newArrayValue.length < index) {
                    newArrayValue.push(null);
                }
                newArrayValue[index] =
                    keyParts.length > 0
                        ? setValue((arrayValue[index] as Value) || null, keyParts, fieldValue)
                        : fieldValue;
            } else {
                newArrayValue = [...arrayValue.slice(0, index), ...arrayValue.slice(index + 1)];
            }
            return newArrayValue.length > 0 ? newArrayValue : null;
        }
        const objectValue = value as Record<string, unknown>;
        return {
            ...objectValue,
            [key]:
                keyParts.length > 0
                    ? setValue(
                          objectValue !== null ? (objectValue[key] as Value) || null : null,
                          keyParts,
                          fieldValue,
                      )
                    : fieldValue,
        };
    }
    return null;
}

export default setValue;
