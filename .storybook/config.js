/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/react';
/* eslint-enable import/no-extraneous-dependencies */
import '../src/styles/bootstrap.scss';

// Load stories
const req = require.context('../src', true, /\.story\.jsx?$/);
function loadStories() {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
