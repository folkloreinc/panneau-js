import { fr as allFr, getDefaultMessages } from '@panneau/intl';

import { messages } from '../shared/messages';

/**
 * The English messages of `@panneau/fields`, by id. They are also the default messages.
 *
 * @deprecated Use `en`, or `withPanneauMessages()`, from `@panneau/intl`: they have the messages
 * of every package.
 */
export const en: Record<string, string> = getDefaultMessages(messages);

/**
 * The French messages of `@panneau/fields`, by id.
 *
 * @deprecated Use `fr`, or `withPanneauMessages()`, from `@panneau/intl`: they have the messages
 * of every package.
 */
export const fr: Record<string, string> = Object.fromEntries(
    Object.entries(allFr).filter(([id]) => id in en),
);
