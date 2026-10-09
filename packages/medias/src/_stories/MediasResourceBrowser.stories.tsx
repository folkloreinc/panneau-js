import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import withApi from '../../../../.storybook/decorators/withDataProvider';
import ActionsProvider from '../../../actions/src';
import { PanneauProvider } from '../../../core/src/contexts';
import DisplaysProvider from '../../../displays/src';
import FieldsProvider from '../../../fields/src';
import FiltersProvider from '../../../filters/src';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediasResourceBrowser from '../MediasResourceBrowser';

export default {
    title: 'Medias/MediasResourceBrowser',
    component: MediasResourceBrowser,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

function Container(props) {
    return (
        <FieldsProvider>
            <IntlProvider>
                <DisplaysProvider>
                    <FiltersProvider>
                        <ActionsProvider>
                            <PanneauProvider definition={panneauDefinition}>
                                <MediasResourceBrowser {...props} />
                            </PanneauProvider>
                        </ActionsProvider>
                    </FiltersProvider>
                </DisplaysProvider>
            </IntlProvider>
        </FieldsProvider>
    );
}

export const Default = {
    render: () => (
        <UppyProvider>
            <Container />
        </UppyProvider>
    ),
};
