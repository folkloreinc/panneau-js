import isObject from 'lodash-es/isObject';

const createNullableOnChange =
    (onChange = null) =>
    (newValue) => {
        let nullableValue = newValue;
        if (isObject(newValue)) {
            const allNull = Object.keys(newValue).reduce(
                (acc, key) => acc && newValue[key] === null,
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

export default createNullableOnChange;
