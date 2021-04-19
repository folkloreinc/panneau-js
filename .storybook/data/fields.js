export default [
    {
        component: 'test',
        name: 'a-test',
        label: 'A Test',
        placeholder: 'cool',
    },
    {
        component: 'test',
        name: 'a-test-h',
        label: 'A test H',
        horizontal: true,
    },
    {
        component: 'fields',
        name: 'cool-row',
        label: '<Fields> of fields',
        fields: [
            {
                component: 'test',
                name: 'b-test',
                placeholder: 'b-test',
            },
            {
                component: 'test',
                name: 'c-test',
                placeholder: 'c-test',
            },
            {
                component: 'test',
                name: 'd-test',
                placeholder: 'd-test',
            },
        ],
    },
    {
        component: 'fields',
        name: 'Cooool',
        label: 'Empty fields',
    },
];
