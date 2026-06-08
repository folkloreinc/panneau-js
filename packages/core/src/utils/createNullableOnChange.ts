import isObject from 'lodash-es/isObject';

function createNullableOnChange<T = unknown>(
    onChange: ((value: T | null) => void) | null = null,
): (newValue: T) => void {
    return function nullableOnChange(newValue: T): void {
        let nullableValue: T | null = newValue;
        if (isObject(newValue)) {
            const allNull = Object.keys(newValue as Record<string, unknown>).reduce(
                (acc, key) => acc && (newValue as Record<string, unknown>)[key] === null,
                true,
            );
            if (allNull) {
                nullableValue = null;
            }
        }
        if (onChange !== null) {
            onChange(nullableValue);
        }
    };
}

export default createNullableOnChange;
