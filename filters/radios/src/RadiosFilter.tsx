/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import type { SelectOption } from '@panneau/core/types';
import Radios from '@panneau/element-radios';

interface RadiosFilterProps {
    name?: string;
    options?: SelectOption[];
    value?: string | null;
    onChange: (value: unknown) => void;
    className?: string | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function RadiosFilter({
    name = 'radios',
    value = null,
    options = DEFAULT_OPTIONS,
    onChange,
    className = null,
    ...props
}: RadiosFilterProps) {
    return (
        <div className={className || undefined}>
            <Radios
                {...props}
                name={name}
                value={value}
                options={options}
                onChange={onChange}
                uncheckable
            />
        </div>
    );
}

export default RadiosFilter;
