import Select from '../Select';

export default {
    component: Select,
    title: 'Displays/Select',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <Select
            value="hello"
            field={{
                options: [
                    { label: 'Hello!', value: 'hello' },
                    { label: 'Goodbye!', value: 'goodbye' },
                ],
            }}
        />
    ),
};

export const Empty = {
    render: () => <Select value="hello" />,
};

export const withOptions = {
    render: () => (
        <Select
            value="hello"
            options={[
                { label: 'Hello!', value: 'hello' },
                { label: 'Goodbye!', value: 'goodbye' },
            ]}
            onChange={() => {}}
        />
    ),
};
