export default [
    {
        type: 'test',
        name: 'a-test',
        label: 'A Test',
        placeholder: 'cool',
    },
    {
        type: 'test',
        name: 'a-test-h',
        label: 'A test H',
        horizontal: true,
    },
    {
        type: 'fields',
        name: 'cool-row',
        row: true,
        label: 'Cool row',
        fields: [
            {
                name: 'b-test',
                type: 'test',
                placeholder: 'b-test',
            },
            {
                name: 'c-test',
                type: 'test',
                placeholder: 'c-test',
            },
            {
                name: 'd-test',
                type: 'test',
                placeholder: 'd-test',
            },
        ],
    },
    {
        type: 'fields',
        name: 'Cooool hhh',
        label: 'Cool H',
        row: true,
        fields: [
            {
                type: 'test',
                name: 'e-test',
                label: 'e-test',
            },
            {
                type: 'test',
                name: 'f-test',
                label: 'f-test',
            },
        ],
    },
];
