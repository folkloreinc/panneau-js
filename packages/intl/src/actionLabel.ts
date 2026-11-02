import type { IntlShape } from 'react-intl';

import { actionsMessages } from './messages/actions';

/**
 * The label of an action: its `label`, or, for the built-in links `show` and `edit` that have
 * none, the label of the client in its locale (decision 0040). Other actions always have one.
 */
export function getActionLabel(
    action: { readonly id: string; readonly label?: string | undefined },
    intl: Pick<IntlShape, 'formatMessage'>,
): string {
    if (action.label !== undefined) {
        return action.label;
    }
    if (action.id === 'show') {
        return intl.formatMessage(actionsMessages.show);
    }
    if (action.id === 'edit') {
        return intl.formatMessage(actionsMessages.edit);
    }
    return action.id;
}
