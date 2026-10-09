import DateTimeField from './DateTimeField';

interface DateFieldProps {
    dateFormat?: string;
    [key: string]: unknown;
}

function DateField({ dateFormat = 'yyyy-MM-dd', ...props }: DateFieldProps) {
    return <DateTimeField {...props} withoutTime dateFormat={dateFormat} />;
}

export default DateField;
