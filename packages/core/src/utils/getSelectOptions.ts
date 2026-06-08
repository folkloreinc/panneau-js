import capitalize from 'lodash-es/capitalize';
import isObject from 'lodash-es/isObject';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';

import type { SelectOption } from '../types';

interface FormattedOption {
    value: unknown;
    label: string | ReactElement;
}

function getSelectOptions(options: SelectOption[]): FormattedOption[] {
    return options.map((it) => {
        if (isObject(it)) {
            const { label = null, value } = it as Record<string, unknown>;
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
}

export default getSelectOptions;
