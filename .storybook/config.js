/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/react';
/* eslint-enable import/no-extraneous-dependencies */
import '../packages/react-panneau/src/styles/bootstrap.global.scss';

// Load stories
// const packagesRequire = require.context('../packages', true, /\.story\.jsx?$/);
const fieldsRequire = require.context('../fields', true, /\.story\.jsx?$/);
function loadStories() {
    // packagesRequire.keys().forEach(filename => packagesRequire(filename));
    fieldsRequire.keys().forEach(filename => fieldsRequire(filename));
}

configure(loadStories, module);
