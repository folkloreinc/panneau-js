import { type ReactNode, useState } from 'react';

import { formsMessages } from '@panneau/intl';
import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

export interface CloseConfirmation {
    /** Closes right away without unsaved changes; otherwise asks first, and closes on "Leave". */
    requestClose: () => void;
    /** The dialog to render, while it is open. */
    dialog: ReactNode;
}

/**
 * Asks before the picker closes with unsaved changes, in the dialog and with the words of leaving a
 * form page (`useLeaveConfirmation()` of `@panneau/forms`). Its own copy: the picker loads neither
 * `@panneau/core` nor what depends on it.
 */
export function useCloseConfirmation(dirty: boolean, close: () => void): CloseConfirmation {
    const intl = usePanneauIntl();
    const [open, setOpen] = useState(false);
    return {
        requestClose: () => {
            if (dirty) {
                setOpen(true);
            } else {
                close();
            }
        },
        dialog: (
            <Dialog
                isOpen={open}
                onOpenChange={setOpen}
                role="alertdialog"
                size="sm"
                title={intl.formatMessage(formsMessages.leaveTitle)}
                footer={
                    <>
                        <Button onPress={() => setOpen(false)} autoFocus>
                            {intl.formatMessage(formsMessages.stay)}
                        </Button>
                        <Button
                            tone="danger"
                            onPress={() => {
                                setOpen(false);
                                close();
                            }}
                        >
                            {intl.formatMessage(formsMessages.leave)}
                        </Button>
                    </>
                }
            >
                {intl.formatMessage(formsMessages.leaveMessage)}
            </Dialog>
        ),
    };
}
