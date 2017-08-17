/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/react';
import '../src/styles/bootstrap.scss';
/* eslint-enable import/no-extraneous-dependencies */

const req = require.context('../src', true, /__stories__/);
function loadStories() {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
