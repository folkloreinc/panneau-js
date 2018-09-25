import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import UploadButton from '../UploadButton';

storiesOf('Fields/Core/UploadButton', module)
    .add('simple', () => (
        <div>
            <IntlProvider locale="en">
                <UploadButton
                    onUploadStart={action('uploadStart')}
                    onUploadComplete={action('uploadComplete')}
                    onUploadError={action('uploadError')}
                />
            </IntlProvider>
        </div>
    ));
