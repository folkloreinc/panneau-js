import { messages } from '../shared/messages';
import { fr } from './fr';

/** The English messages of `@panneau/fields`, by id. They are also the default messages. */
export const en: Record<string, string> = Object.fromEntries(
    Object.values(messages).map(({ id, defaultMessage }) => [id, defaultMessage]),
);

export { fr };
