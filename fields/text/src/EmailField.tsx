import InputField from './InputField';

interface EmailFieldProps {
    [key: string]: unknown;
}

function EmailField(props: EmailFieldProps) {
    return <InputField {...props} type="email" />;
}

export default EmailField;
