import { messages } from '../intl/messages';
import { fr } from './fr';

/** The English messages of `@panneau/ui`, by id. They are also the default messages. */
export const en: Record<string, string> = Object.fromEntries(
    Object.values(messages).map(({ id, defaultMessage }) => [id, defaultMessage]),
);

export { fr };
