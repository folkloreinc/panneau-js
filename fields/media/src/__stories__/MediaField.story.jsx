import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import AudioField from '../AudioField';
import DocumentField from '../DocumentField';
import PictureField from '../PictureField';
import VideoField from '../VideoField';

storiesOf('Fields/Media', module)
    .add('audio', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <AudioField
                        label="Audio"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ))
    .add('document', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <DocumentField
                        label="Document"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ))
    .add('picture', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <PictureField
                        label="Picture"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ))
    .add('video', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <VideoField
                        label="Video"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ));
