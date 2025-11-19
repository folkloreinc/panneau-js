import React from 'react';

import type { FieldOption } from '@panneau/core/types';
import Radios from '@panneau/element-radios';

interface RadiosFieldProps {
    name?: string | null;
    value?: string | null;
    options?: FieldOption[];
    withBackground?: boolean;
    disabled?: boolean;
    uncheckable?: boolean;
    className?: string | null;
    buttonClassName?: string | null;
    onChange?: ((value: string | null) => void) | null;
}

const DEFAULT_OPTIONS: FieldOption[] = [];

function RadiosField({
    name = null,
    value = null,
    options = DEFAULT_OPTIONS,
    withBackground = false,
    disabled = false,
    uncheckable = false,
    className = null,
    buttonClassName = null,
    onChange = null
}: RadiosFieldProps) {
    return (
        <Radios
            name={name}
            value={value}
            options={options}
            withBackground={withBackground}
            className={className}
            buttonClassName={buttonClassName}
            onChange={onChange}
            disabled={disabled}
            uncheckable={uncheckable}
        />
    );
}

export default RadiosField;
