import type { IntlShape } from 'react-intl';

import { actionsMessages } from './messages/actions';

/**
 * The label of an action: its `label`, or, for the built-in item actions (`show`, `edit`,
 * `duplicate`, `delete`) that have none, the label of the client in its locale (decision 0040).
 * Other actions always have one.
 */
export function getActionLabel(
    action: { readonly id: string; readonly label?: string | undefined },
    intl: Pick<IntlShape, 'formatMessage'>,
): string {
    if (action.label !== undefined) {
        return action.label;
    }
    switch (action.id) {
        case 'show':
            return intl.formatMessage(actionsMessages.show);
        case 'edit':
            return intl.formatMessage(actionsMessages.edit);
        case 'duplicate':
            return intl.formatMessage(actionsMessages.duplicate);
        case 'delete':
            return intl.formatMessage(actionsMessages.delete);
        default:
            return action.id;
    }
}
