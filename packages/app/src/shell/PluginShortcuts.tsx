import { type Shortcut, getShortcuts, usePlugins } from '@panneau/core';
import type { Definition } from '@panneau/protocol';
import { useShortcut } from '@panneau/ui';

function PluginShortcut({ shortcut }: { shortcut: Shortcut }) {
    useShortcut({
        id: shortcut.id,
        keys: shortcut.keys,
        label: shortcut.label,
        group: shortcut.group,
        perform: () => shortcut.perform(),
    });
    return null;
}

/**
 * The shortcuts of plugins (`shortcuts` of `PanneauPlugin`, decision 0110), shortcuts of the page
 * while the shell is shown, in plugin order.
 */
export function PluginShortcuts({ definition }: { definition: Definition }) {
    const plugins = usePlugins();
    return getShortcuts(plugins.shortcuts, { definition }).map((shortcut) => (
        <PluginShortcut key={shortcut.id} shortcut={shortcut} />
    ));
}
