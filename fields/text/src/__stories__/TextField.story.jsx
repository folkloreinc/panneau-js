import React, { useState } from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import TextField from '../TextField';
import TextLocaleField from '../TextLocaleField';

storiesOf('Fields/Text', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <TextField
                    label="Label"
                    helpText="This is an help text"
                    placeholder="This is a placeholder..."
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <TextField label="Disabled" disabled onChange={action('change')} />
            </KeepValue>
            <KeepValue>
                <TextField
                    label="With an error"
                    errors="This field is invalid"
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <TextField label="With a maxlength" maxLength={10} onChange={action('change')} />
            </KeepValue>
        </div>
    ))
    .add('with suffix and prefix', () => (
        <TextField
            label="Label"
            helpText="This is an help text"
            placeholder="0.00"
            prefix="Total"
            suffix="$"
            align="right"
            onChange={action('change')}
        />
    ))
    .add('editor', () => {
        const [value, setValue] = useState('Hey');
        const [itemIndex, setItemIndex] = useState(null);
        return (
            <>
                <TextField label="Editor" type="editor" value={value} onChange={setValue} itemIndex={itemIndex} />
                <button type="button" onClick={() => { setValue('LOL'); setItemIndex(10); }}>Set a new value from parent</button>
            </>
        );
    })
    .add('other field types', () => (
        <div>
            <KeepValue>
                <TextLocaleField
                    label="TextLocale"
                    locales={['fr', 'en']}
                    prefix={{
                        fr: 'Préfixe en français',
                        en: 'English prefix',
                    }}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <TextField label="Textarea" type="textarea" onChange={action('change')} />
            </KeepValue>
            <form>
                <KeepValue>
                    <TextField label="Editor" type="editor" onChange={action('change')} />
                </KeepValue>
            </form>
            <KeepValue>
                <TextField
                    label="Number"
                    type="number"
                    onChange={action('change')}
                    step={0.01}
                    min={1}
                    max={10}
                    readOnly={false}
                />
            </KeepValue>
        </div>
    ));
