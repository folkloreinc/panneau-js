import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import AudioField from '../AudioField';
import AudiosField from '../AudiosField';
import DocumentField from '../DocumentField';
import DocumentsField from '../DocumentsField';
import PictureField from '../PictureField';
import PicturesField from '../PicturesField';
import VideoField from '../VideoField';
import VideosField from '../VideosField';

storiesOf('Fields/Media', module)
    .add('audio', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <AudioField
                        label="Audio"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <AudiosField
                        label="Audios"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('document', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <DocumentField
                        label="Document"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <DocumentsField
                        label="Documents"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('picture', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <PictureField
                        label="Picture"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <PicturesField
                        label="Pictures"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('video', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <VideoField
                        label="Video"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <VideosField
                        label="Videos"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
