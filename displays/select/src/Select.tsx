import isString from 'lodash-es/isString';
import React from 'react';

import SelectElement from '@panneau/element-select';
import type { Field, FieldOption } from '@panneau/core/types';

interface SelectProps {
    field: Field;
    value?: string | null;
    options?: FieldOption[] | null;
    onChange?: ((value: unknown) => void) | null;
}

function Select({ field, value = null, options: providedOptions = null, onChange = null }: SelectProps) {
    const { options = null } = field || {};
    const finalOptions = providedOptions || options || null;
    const option =
        (finalOptions || []).find(({ value: itemValue = null }) => itemValue === value) || null;
    const label = option !== null ? option.label : null;
    const finalLabel = isString(value) ? value : label;

    return finalOptions !== null ? (
        <SelectElement value={value} options={finalOptions} onChange={onChange} />
    ) : (
        <div>{finalLabel}</div>
    );
}

export default Select;
