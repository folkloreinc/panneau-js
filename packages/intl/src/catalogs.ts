import { actionsFr } from './fr/actions';
import { appFr } from './fr/app';
import { fieldsFr } from './fr/fields';
import { formsFr } from './fr/forms';
import { listsFr } from './fr/lists';
import { mediaFr } from './fr/media';
import { uiFr } from './fr/ui';
import type { PanneauMessage } from './message';
import { actionsMessages } from './messages/actions';
import { appMessages } from './messages/app';
import { fieldsMessages } from './messages/fields';
import { formsMessages } from './messages/forms';
import { listsMessages } from './messages/lists';
import { mediaMessages } from './messages/media';
import { uiMessages } from './messages/ui';

/** Messages by id, as react-intl's `IntlProvider` takes them. */
export type MessageCatalog = Record<string, string>;

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
};

/** The French messages of every Panneau package, by id. */
export const fr: MessageCatalog = {
    ...uiFr,
    ...fieldsFr,
    ...formsFr,
    ...listsFr,
    ...actionsFr,
    ...appFr,
    ...mediaFr,
};

/** The messages of every Panneau package, by locale. */
export const panneauMessages: Readonly<Record<string, MessageCatalog>> = { en, fr };
