import { Copy } from 'lucide-react';

import { Button, Menu, MenuItem, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../shared/messages';
import { useLocaleName } from './localeName';

export interface CopyFromLocaleProps {
    /** The filled locales the shown one can be copied from. */
    sources: readonly string[];
    onCopy: (source: string) => void;
}

/**
 * "Copy from …" next to the switch of a localized field, for an empty locale: a button for a
 * single filled locale, a menu of them for several.
 */
export function CopyFromLocale({ sources, onCopy }: CopyFromLocaleProps) {
    const intl = usePanneauIntl();
    const localeName = useLocaleName();
    const [only] = sources.length === 1 ? sources : [];
    if (only !== undefined) {
        return (
            <Button size="sm" appearance="ghost" icon={Copy} onPress={() => onCopy(only)}>
                {intl.formatMessage(messages.copyFromLocale, { locale: localeName(only) })}
            </Button>
        );
    }
    return (
        <MenuTrigger>
            <Button size="sm" appearance="ghost" icon={Copy}>
                {intl.formatMessage(messages.copyFromLocales)}
            </Button>
            <Menu
                aria-label={intl.formatMessage(messages.copyFromLocales)}
                placement="bottom end"
                onAction={(key) => onCopy(String(key))}
            >
                {sources.map((source) => (
                    <MenuItem key={source} id={source}>
                        {localeName(source)}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    );
}
