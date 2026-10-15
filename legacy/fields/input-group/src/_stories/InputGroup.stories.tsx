import InputGroupField from '../InputGroupField';

export default {
    title: 'Fields/InputGroup',
    component: InputGroupField,
};

export const Normal = {
    render: () => (
        <InputGroupField prepend="Prepend" append="Append">
            <input className="form-control" />
        </InputGroupField>
    ),
};
