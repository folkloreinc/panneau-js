import InputField from './InputField';

interface TextFieldProps {
    [key: string]: unknown;
}

function TextField(props: TextFieldProps) {
    return <InputField {...props} type="text" />;
}

export default TextField;
