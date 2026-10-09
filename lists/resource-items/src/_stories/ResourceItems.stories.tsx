import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withDataProvider';
import DisplaysProvider from '../../../../packages/displays/src';
import ListsProvider from '../../../../packages/lists/src';
import ResourceItems from '../ResourceItems';

export default {
    component: ResourceItems,
    title: 'Lists/ResourceItems',
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

function Container() {
    return (
        <ListsProvider>
            <DisplaysProvider>
                <ResourceItems resource={pageResource} />
            </DisplaysProvider>
        </ListsProvider>
    );
}

export const Normal = {
    render: () => <Container />,
};
