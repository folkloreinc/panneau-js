import InputField from './InputField';

interface TextFieldProps {
    [key: string]: unknown;
}

function TextField(props: TextFieldProps) {
    return <InputField type="text" {...props} />;
}

export default TextField;
