import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import Card from '../Card';

const item = {
    name: 'Item',
    created_at: '2017-11-01 13:33:45',
    details: {
        Duration: '2 sec',
    },
};

const itemWithThumbnail = {
    name: 'Item with thumbnail',
    thumbnail: 'https://picsum.photos/400/400',
    created_at: '2017-11-01 13:33:45',
    details: {
        Size: '400x400',
    },
};

storiesOf('Fields/Core/Card', module)
    .add('simple', () => (
        <div>
            <Card
                item={item}
                onLoad={action('load')}
            />
            <Card
                item={itemWithThumbnail}
                deleteIcon="glyphicon glyphicon-remove"
                onLoad={action('load')}
            />
            <Card
                item={itemWithThumbnail}
                selectable
                onLoad={action('load')}
            />
        </div>
    ))
    .add('vertical', () => (
        <div>
            <Card
                vertical
                item={item}
                onLoad={action('load')}
            />
            <Card
                vertical
                item={itemWithThumbnail}
                onLoad={action('load')}
            />
        </div>
    ));
