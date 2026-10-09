import pageResource from '../../../../.storybook/data/resources/pages';
import withDataProvider from '../../../../.storybook/decorators/withDataProvider';
import FieldsProvider from '../../../../packages/fields/src';
import Resource from '../Resource';

export default {
    component: Resource,
    title: 'Forms/Resource',
    parameters: {
        intl: true,
    },
    decorators: [
        withDataProvider,
        (Story) => (
            <FieldsProvider>
                <Story />
            </FieldsProvider>
        ),
    ],
};

export const Create = {
    render: () => <Resource resource={pageResource} />,
};

export const CreateWithType = {
    name: 'Create with type',
    render: () => <Resource resource={pageResource} type="contact" />,
};
