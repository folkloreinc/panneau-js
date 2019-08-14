import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import EditorField from '../EditorField';
import EditorLocaleField from '../EditorLocaleField';

storiesOf('Fields/Editor', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <EditorField
                    label="Label"
                    helpEditor="This is an help Editor"
                    placeholder="This is a placeholder..."
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <EditorField label="Disabled" disabled onChange={action('change')} />
            </KeepValue>
            <KeepValue>
                <EditorField
                    label="With an error"
                    errors="This field is invalid"
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <EditorField label="With a maxlength" maxLength={10} onChange={action('change')} />
            </KeepValue>
        </div>
    ))
    .add('other field types', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <EditorLocaleField
                        label="EditorLocale"
                        locales={['fr', 'en']}
                        prefix={{
                            fr: 'Préfixe en français',
                            en: 'English prefix',
                        }}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
