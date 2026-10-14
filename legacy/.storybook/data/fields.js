export default [
    {
        type: 'text',
        name: 'a-test',
        label: 'A Test',
        placeholder: 'cool',
    },
    {
        type: 'text',
        name: 'b-test',
        label: 'A Test',
        placeholder: 'cool',
    },
    // {
    //     type: 'image',
    //     name: 'a-test-h',
    //     label: 'A test H',
    //     horizontal: true,
    // },
    {
        component: 'fields',
        name: 'cool-row',
        horizontal: true,
        label: '<Fields> of fields horizontal... .... ... ',
        flat: true,
        fields: [
            {
                component: 'text',
                name: 'g-test',
                placeholder: 'g-test',
                label: 'My label',
            },
            {
                component: 'text',
                name: 'e-test',
                placeholder: 'e-test',
                label: 'My mid label',
            },
            {
                component: 'text',
                name: 'f-test',
                placeholder: 'f-test',
                label: 'My other label',
            },
        ],
    },
    {
        component: 'fields',
        name: 'other-row',
        horizontal: false,
        label: '<Fields> of fields vertical',
        fields: [
            {
                component: 'text',
                name: 'g-test',
                placeholder: 'g-test',
            },
            {
                component: 'text',
                name: 'e-test',
                placeholder: 'e-test',
            },
        ],
    },
    {
        component: 'fields',
        name: 'Cooool',
        label: 'Empty fields',
    },
];
