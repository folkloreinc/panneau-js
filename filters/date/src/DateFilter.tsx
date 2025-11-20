import type { SelectOption } from '@panneau/core/types';
import { Date } from '@panneau/field-date';

interface DateFilterProps {
    name?: string;
    options?: SelectOption[];
    value?: string | null;
    onChange: (value: unknown) => void;
    placeholder?: string | null;
    className?: string | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function DateFilter({
    name = 'radios',
    value = null,
    options = DEFAULT_OPTIONS,
    placeholder = null,
    onChange,
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
