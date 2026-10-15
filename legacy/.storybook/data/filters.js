export default [
    {
        name: 'search',
        placeholder: 'Chercher',
        component: 'search',
    },
    {
        name: 'trucs',
        placeholder: 'Sélectionner un truc',
        component: 'select',
        options: [
            { label: 'Truc A', value: 'A' },
            { label: 'Truc B', value: 'B' },
            { label: 'Truc C', value: 'C' },
            { label: 'Truc D', value: 'D' },
        ],
    },
    {
        name: 'custom',
        placeholder: 'Oui',
        component: 'toggle',
        label: '02351',
    },
];
