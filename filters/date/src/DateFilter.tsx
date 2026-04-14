import type { SelectOption } from '@panneau/core';
import { Date } from '@panneau/field-date';

interface DateFilterProps {
    onChange: (value: unknown) => void;
    onClear?: (() => void) | null;
    name?: string;
    options?: SelectOption[];
    value?: string | null;
    placeholder?: string | null;
    className?: string | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function DateFilter({
    onChange = null,
    onClear = null,
    name = 'radios',
    value = null,
    options = DEFAULT_OPTIONS,
    placeholder = null,
    className = null,
    ...props
}: DateFilterProps) {
    return (
        <div className={className || undefined}>
            <Date
                {...props}
                name={name}
                value={value}
                options={options}
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
}

export default DateFilter;
