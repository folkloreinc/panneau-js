import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

import { messages } from './messages';

/**
 * Asks the browser to confirm before the page is closed or reloaded while `dirty` is true. Forms
 * use it by default.
 */
export function useBeforeUnloadGuard(dirty: boolean): void {
    useEffect(() => {
        if (!dirty) {
            return undefined;
        }
        const listener = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            // Older browsers show the dialog only with a return value.
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', listener);
        return () => window.removeEventListener('beforeunload', listener);
    }, [dirty]);
}

export interface LeaveConfirmation {
    /**
     * Resolves `true` when leaving is fine: right away without unsaved changes, or once the user
     * chose to leave in the dialog.
     */
    confirmLeave: () => Promise<boolean>;
    /** The dialog to render, while it is open. */
    dialog: ReactNode;
}

/**
 * Guards in-app navigation while a form has unsaved changes. Call `confirmLeave()` from the
 * router's navigation guard (or before closing a panel), and render `dialog`. The page itself is
 * guarded by `useBeforeUnloadGuard()`.
 */
export function useLeaveConfirmation(dirty: boolean): LeaveConfirmation {
    const intl = usePanneauIntl();
    const [open, setOpen] = useState(false);
    const resolver = useRef<((leave: boolean) => void) | null>(null);
    const answer = (leave: boolean) => {
        resolver.current?.(leave);
        resolver.current = null;
        setOpen(false);
    };
    return {
        confirmLeave: () => {
            if (!dirty) {
                return Promise.resolve(true);
            }
            resolver.current?.(false);
            setOpen(true);
            return new Promise<boolean>((resolve) => {
                resolver.current = resolve;
            });
        },
        dialog: (
            <Dialog
                isOpen={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        answer(false);
                    }
                }}
                role="alertdialog"
                size="sm"
                title={intl.formatMessage(messages.leaveTitle)}
                footer={
                    <>
                        <Button onPress={() => answer(false)} autoFocus>
                            {intl.formatMessage(messages.stay)}
                        </Button>
                        <Button variant="danger" onPress={() => answer(true)}>
                            {intl.formatMessage(messages.leave)}
                        </Button>
                    </>
                }
            >
                {intl.formatMessage(messages.leaveMessage)}
            </Dialog>
        ),
    };
}
