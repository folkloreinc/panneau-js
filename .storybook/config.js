/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/react';
/* eslint-enable import/no-extraneous-dependencies */
import '../src/styles/bootstrap.scss';

// Load stories
const req = require.context('../src', true, /__stories__/);
function loadStories() {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
