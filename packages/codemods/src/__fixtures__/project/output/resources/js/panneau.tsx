import { createPanneauApp } from '@panneau/app';

import projectPlugin from './components/Panneau';

// The admin panel, mounted in the page of laravel-panneau. Add the project's plugins (fields,
// pages, themes) to the list.
createPanneauApp({
    element: document.getElementById('panneau')!,
    plugins: [projectPlugin],
});
