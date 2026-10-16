import type { TypedMessageDescriptor } from 'react-intl';

/** The values a message takes: `{ count: number }` for `{count, plural, …}`. */
export type PanneauMessageValues = Record<
    string,
    string | number | boolean | Date | null | undefined
>;

/**
 * A message of a Panneau package, for react-intl's `formatMessage()`: its id, its English text,
 * and the values it takes, which `formatMessage()` checks.
 */
export type PanneauMessage<V extends PanneauMessageValues = Record<never, never>> =
    TypedMessageDescriptor<V> & {
        readonly id: string;
        readonly defaultMessage: string;
    };

/** Declares a message, with the type of the values it takes: `defineMessage<{ count: number }>()`. */
export function defineMessage<V extends PanneauMessageValues = Record<never, never>>(message: {
    id: string;
    defaultMessage: string;
}): PanneauMessage<V> {
    return message as PanneauMessage<V>;
}
