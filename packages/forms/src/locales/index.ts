import type { MessageDescriptor } from 'react-intl';

import { messages } from '../messages';
import { fr } from './fr';

function flatten(entries: object): MessageDescriptor[] {
    return Object.values(entries).flatMap((entry: MessageDescriptor | object) =>
        'id' in entry ? [entry as MessageDescriptor] : flatten(entry),
    );
}

/** The English messages of `@panneau/forms`, by id. They are also the default messages. */
export const en: Record<string, string> = Object.fromEntries(
    flatten(messages).map(({ id, defaultMessage }) => [String(id), String(defaultMessage)]),
);

export { fr };
