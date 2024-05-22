import capitalize from 'lodash-es/capitalize';
import isObject from 'lodash-es/isObject';
import { isValidElement } from 'react';

const getSelectOptions = (options) =>
    options.map((it) => {
        if (isObject(it)) {
            const { label = null, value } = it;
            if (label === null) {
                return { value, label: capitalize(`${value}`) };
            }
            return {
                value,
                label: isValidElement(label) ? label : `${label}`,
            };
        }
        return { value: it, label: capitalize(`${it}`) };
    });

export default getSelectOptions;
