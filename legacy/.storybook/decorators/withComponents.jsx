import ActionsProvider from '../../packages/actions/src';
import DisplaysProvider from '../../packages/displays/src';
import FieldsProvider from '../../packages/fields/src';
import FiltersProvider from '../../packages/filters/src';
import FormsProvider from '../../packages/forms/src';
import ListsProvider from '../../packages/lists/src';
import ModalsProvider from '../../packages/modals/src';

// Registers all the components (fields, forms, lists, actions...) like the app does, so a
// component can find the other components it uses by name (ex: an "edit" action in a list)
function withComponents(Story) {
    return (
        <FieldsProvider>
            <FormsProvider>
                <ListsProvider>
                    <DisplaysProvider>
                        <FiltersProvider>
                            <ActionsProvider>
                                <ModalsProvider>
                                    <Story />
                                </ModalsProvider>
                            </ActionsProvider>
                        </FiltersProvider>
                    </DisplaysProvider>
                </ListsProvider>
            </FormsProvider>
        </FieldsProvider>
    );
}

export default withComponents;
