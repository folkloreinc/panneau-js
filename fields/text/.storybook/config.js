import { configure } from '@storybook/react';
import '../../../.storybook/imports';

// Load stories
function loadStories() {
    require('glob-loader!./stories.pattern');
}

configure(loadStories, module);
