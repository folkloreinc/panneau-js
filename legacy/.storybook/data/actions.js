export default [
    {
        id: 'edit',
        component: 'edit',
        endpoint: '/api/batch',
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
        endpoint: '/api/custom',
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
    {
        id: 'import',
        component: 'import',
        template: {
            columns: [
                { name: 'id', key: 'id', description: 'ID of the user', data_type: 'number' },
                {
                    name: 'column_string',
                    data_type: 'string',
                    key: 'name',
                    required: true,
                    description: 'Name of the user',
                    suggested_mappings: ['First', 'Name', 'Fullname'],
                },
            ],
        },
        global: true,
    },
    {
        id: 'upload',
        component: 'upload',
        global: true,
    },

    // 'duplicate',
];
