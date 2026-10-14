import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import withUppy from '../../../../.storybook/decorators/withUppy';
import Upload from '../Upload';

export default {
    component: Upload,
    title: 'Modals/Upload',
    decorators: [withUppy],
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: (props) => (
        <ModalProvider>
            <Modals />
            <Upload {...props} />
        </ModalProvider>
    ),
};
