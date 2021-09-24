import capitalize from 'lodash/capitalize';
import isObject from 'lodash/isObject';

const getSelectOptions = (options) =>
    options.map((it) => {
        if (isObject(it)) {
            const { label = null, value } = it;
            if (label === null) {
                return { value, label: capitalize(value) };
            }
            return it;
        }
        return { value: it, label: capitalize(it) };
    });

export default getSelectOptions;
