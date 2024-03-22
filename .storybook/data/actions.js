export default [
    {
        id: 'edit',
        component: 'edit',
        endpoint: '/batch',
        fields: [
            {
                type: 'select',
                name: 'select-test',
                label: 'A Select',
                placeholder: 'Select me',
            },
            {
                type: 'text',
                name: 'a-test',
                label: 'A Test',
                placeholder: 'cool',
            },
        ],
        multiple: true,
    },
    {
        id: 'custom-edit',
        component: 'edit',
        endpoint: '/custom',
        label: 'Custom',
        icon: 'circle',
        fields: [
            {
                type: 'select',
                name: 'select-test',
                label: 'A Select',
                placeholder: 'Select me',
            },
        ],
        multiple: false,
    },
    {
        id: 'delete',
        component: 'delete',
        multiple: false,
    },
];
