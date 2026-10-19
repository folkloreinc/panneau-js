import { describe, expect, it } from 'vitest';

import { cssModuleComponent, stableClassName } from './class-names';

describe('stable class names', () => {
    it.each([
        ['Button.module.css', 'button'],
        ['/src/select/ListBox.module.css', 'list-box'],
        ['/src/root/PanneauRoot.module.css', 'root'],
        ['/src/layouts/link.module.css', 'link'],
        ['/src/button/Button.module.css?used', 'button'],
    ])('names the component of %s', (file, component) => {
        expect(cssModuleComponent(file)).toBe(component);
    });

    it.each([
        ['badge', 'Badge.module.css', 'panneau-badge'],
        ['header', 'Card.module.css', 'panneau-card-header'],
        ['sm', 'Button.module.css', 'panneau-button-sm'],
        ['iconButton', 'IconButton.module.css', 'panneau-icon-button'],
        ['itemDescription', 'ListBox.module.css', 'panneau-list-box-item-description'],
        ['root', 'PanneauRoot.module.css', 'panneau-root'],
    ])('names .%s of %s', (local, file, name) => {
        expect(stableClassName(local, file)).toBe(name);
    });
});
