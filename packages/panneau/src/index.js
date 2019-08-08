import Panneau from '@panneau/app';
import * as FieldsComponents from '@panneau/fields';
import { NavbarItemsComponents } from '@panneau/layout';
import * as LayoutsComponents from '@panneau/layouts';
import * as ListsComponents from '@panneau/lists';
import { ColumnsComponents } from '@panneau/list-table';
import * as FormsComponents from '@panneau/forms';
import * as ModalsComponents from '@panneau/modals';
import * as PreviewsComponents from '@panneau/previews';

import enMessages from '../intl/lang/en.json';
import frMessages from '../intl/lang/fr.json';

// Set messages
Panneau.setDefaultLocaleMessages('en', enMessages);
Panneau.setDefaultLocaleMessages('fr', frMessages);

// Set default components
Panneau.setDefaultComponentsCollection(FieldsComponents, 'fields');
Panneau.setDefaultComponentsCollection(LayoutsComponents, 'layouts');
Panneau.setDefaultComponentsCollection(ListsComponents, 'lists');
Panneau.setDefaultComponentsCollection(FormsComponents, 'forms');
Panneau.setDefaultComponentsCollection(ModalsComponents, 'modals');
Panneau.setDefaultComponentsCollection(PreviewsComponents, 'previews');
Panneau.setDefaultComponentsCollection(NavbarItemsComponents, 'navbarItems');
Panneau.setDefaultComponentsCollection(ColumnsComponents, 'tableColumns');

export {
    Panneau,
    FieldsComponents,
    LayoutsComponents,
    ListsComponents,
    FormsComponents,
    ModalsComponents,
    PreviewsComponents,
};

const panneau = new Panneau();
export default (el) => {
    if (typeof el !== 'undefined') {
        panneau.render(el);
    }
    return panneau;
};
