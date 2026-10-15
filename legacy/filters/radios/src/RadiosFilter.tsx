import type { SelectOption } from '@panneau/core';
import Radios from '@panneau/element-radios';

interface RadiosFilterProps {
    name?: string;
    options?: SelectOption[];
    value?: string | null;
    onChange: (value: unknown) => void;
    onClear?: (() => void) | null;
    className?: string | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function RadiosFilter({
    name = 'radios',
    value = null,
    options = DEFAULT_OPTIONS,
    onChange = null,
    onClear = null,
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
