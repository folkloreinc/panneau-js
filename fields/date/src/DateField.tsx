import DateTimeField from './DateTimeField';

interface DateFieldProps {
    dateFormat?: string;
    format?: string | null;
    [key: string]: unknown;
}

// The value is stored as a date without time (2026-10-01) by default: an ISO date with the
// browser timezone would be shifted by servers that drop the offset (ex: Laravel)
function DateField({ dateFormat = 'yyyy-MM-dd', format = 'yyyy-MM-dd', ...props }: DateFieldProps) {
    return <DateTimeField {...props} withoutTime dateFormat={dateFormat} format={format} />;
}

export default DateField;
