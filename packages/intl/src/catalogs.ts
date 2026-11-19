import { fr } from './fr/index';
import type { MessageCatalog, PanneauMessage } from './message';
import { actionsMessages } from './messages/actions';
import { appMessages } from './messages/app';
import { editorMessages } from './messages/editor';
import { fieldsMessages } from './messages/fields';
import { formsMessages } from './messages/forms';
import { listsMessages } from './messages/lists';
import { mediaMessages } from './messages/media';
import { uiMessages } from './messages/ui';

export type { MessageCatalog } from './message';
export { fr };

/** The descriptors of a group of messages, with those of nested groups (`formsMessages.rule`). */
export function getDescriptors(group: object): PanneauMessage[] {
    return Object.values(group).flatMap((entry: PanneauMessage | object) =>
        'id' in entry ? [entry as PanneauMessage] : getDescriptors(entry),
    );
}

/** The English text of a group of messages, by id. */
export function getDefaultMessages(group: object): MessageCatalog {
    return Object.fromEntries(
        getDescriptors(group).map(({ id, defaultMessage }) => [String(id), String(defaultMessage)]),
    );
}

/**
 * The English messages of every Panneau package, by id. They are also the default messages of
 * the components, so an app in English needs none of them.
 */
export const en: MessageCatalog = {
    ...getDefaultMessages(uiMessages),
    ...getDefaultMessages(fieldsMessages),
    ...getDefaultMessages(formsMessages),
    ...getDefaultMessages(listsMessages),
    ...getDefaultMessages(actionsMessages),
    ...getDefaultMessages(appMessages),
    ...getDefaultMessages(mediaMessages),
    ...getDefaultMessages(editorMessages),
};

/** The messages of every Panneau package, by locale. */
export const panneauMessages: Readonly<Record<string, MessageCatalog>> = { en, fr };
