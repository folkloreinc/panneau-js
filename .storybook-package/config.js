import { configure } from '@storybook/react';
import '../.storybook/imports';

// Load stories
function loadStories() {
    require('./getStories');
}

configure(loadStories, module);
