import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { fr as fieldsFr } from '@panneau/fields/locales';
import { TextField } from '@panneau/fields/text';
import { Form } from '@panneau/forms';
import { fr as formsFr } from '@panneau/forms/locales';
import { List } from '@panneau/lists';
import { fr as listsFr } from '@panneau/lists/locales';
import { PanneauRoot } from '@panneau/ui';
import { fr as uiFr } from '@panneau/ui/locales';

// A form as a product without a Panneau definition uses it: a list of fields and an `onSubmit`.
const fields = [
    { name: 'title', type: 'text', label: 'Titre', localized: true, rules: [{ rule: 'required' }] },
    {
        name: 'status',
        type: 'select',
        label: 'Statut',
        options: [
            { value: 'draft', label: 'Brouillon' },
            { value: 'published', label: 'Publié' },
        ],
    },
    { name: 'published_on', type: 'date', label: 'Publié le' },
];

// A list as a product uses it: columns and items, with a row action.
const columns = [
    { id: 'title', label: 'Titre', sortable: true },
    { id: 'status', label: 'Statut', field: fields[1], display: 'select' },
    { id: 'published_on', label: 'Publié le', display: 'date' },
];
const items = [
    { id: '1', title: 'Accueil', status: 'published', published_on: '2026-10-01' },
    { id: '2', title: 'Contact', status: 'draft', published_on: null },
    { id: '3', title: 'À propos', status: 'published', published_on: '2026-09-15' },
];
const actions = [{ id: 'archive', label: 'Archiver', kind: 'server', scope: ['item'] }];

function App() {
    return (
        <IntlProvider locale="fr" messages={{ ...uiFr, ...fieldsFr, ...formsFr, ...listsFr }}>
            <PanneauRoot id="root-element">
                <TextField label="Champ seul" value="Une valeur" />
                <Form
                    fields={fields}
                    locales={['fr', 'en']}
                    onSubmit={(values) => {
                        document.body.dataset.submitted = JSON.stringify(values);
                    }}
                />
                <List
                    aria-label="Pages"
                    columns={columns}
                    items={items}
                    search
                    actions={actions}
                    onAction={({ item }) => {
                        document.body.dataset.action = item.id;
                    }}
                    router={null}
                />
            </PanneauRoot>
        </IntlProvider>
    );
}

createRoot(document.getElementById('app')).render(<App />);
