import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { TextField } from '@panneau/fields/text';
import { Form } from '@panneau/forms';
import { withPanneauMessages } from '@panneau/intl';
import { PanneauRoot } from '@panneau/ui';

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

function App() {
    return (
        <IntlProvider locale="fr" messages={withPanneauMessages('fr')}>
            <PanneauRoot id="root-element">
                <TextField label="Champ seul" value="Une valeur" />
                <Form
                    fields={fields}
                    locales={['fr', 'en']}
                    onSubmit={(values) => {
                        document.body.dataset.submitted = JSON.stringify(values);
                    }}
                />
            </PanneauRoot>
        </IntlProvider>
    );
}

createRoot(document.getElementById('app')).render(<App />);
