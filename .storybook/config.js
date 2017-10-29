import { configure } from '@storybook/react';
import './imports';

// Load stories
function loadStories() {
    require('glob-loader!./stories.pattern');
}

configure(loadStories, module);
