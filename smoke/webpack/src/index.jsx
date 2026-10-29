import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { ActionRunnerProvider, useActionRunner } from '@panneau/actions';
import { RichTextField } from '@panneau/editor';
import { TextField } from '@panneau/fields/text';
import { Form } from '@panneau/forms';
import { withPanneauMessages } from '@panneau/intl';
import { List } from '@panneau/lists';
import { PanneauRoot } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

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
// Its icon is a Lucide name, loaded on demand.
const actions = [
    { id: 'archive', label: 'Archiver', icon: 'archive', kind: 'server', scope: ['item'] },
];

// The action part of a data adapter, as a product with its own API writes it.
const adapter = {
    runAction: (resource, action, request) => {
        document.body.dataset.action = request.selection.ids[0];
        return Promise.resolve({ result: { message: 'Page archivée.' } });
    },
    getActionRun: () => Promise.reject(new Error('No queued runs here.')),
};

function Pages() {
    const runAction = useActionRunner('pages');
    return (
        <List
            aria-label="Pages"
            columns={columns}
            items={items}
            search
            actions={actions}
            onAction={runAction}
            router={null}
        />
    );
}

function App() {
    return (
        <IntlProvider locale="fr" messages={withPanneauMessages('fr')}>
            <PanneauRoot id="root-element" iconLoader={lucideIconLoader}>
                <TextField label="Champ seul" value="Une valeur" />
                <Form
                    fields={fields}
                    locales={['fr', 'en']}
                    onSubmit={(values) => {
                        document.body.dataset.submitted = JSON.stringify(values);
                    }}
                />
                <ActionRunnerProvider adapter={adapter}>
                    <Pages />
                </ActionRunnerProvider>
                <RichTextField
                    label="Corps"
                    value="<p>Du <strong>texte</strong></p>"
                    toolbar={['bold', 'italic']}
                    onChange={(value) => {
                        document.body.dataset.richtext = value;
                    }}
                />
            </PanneauRoot>
        </IntlProvider>
    );
}

createRoot(document.getElementById('app')).render(<App />);
