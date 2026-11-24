import { X } from 'lucide-react';
import { Activity, type ReactNode } from 'react';
import {
    Dialog as AriaDialog,
    Heading,
    Modal,
    ModalOverlay,
    type ModalOverlayProps,
} from 'react-aria-components';

import { IconButton } from '../icon-button/IconButton';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { usePortalContainer } from '../root/PanneauRoot';
import { cx } from '../utils/cx';
import { stopPropagation } from '../utils/events';
import styles from './Dialog.module.css';

export interface DialogProps extends Pick<
    ModalOverlayProps,
    'isOpen' | 'defaultOpen' | 'onOpenChange' | 'isKeyboardDismissDisabled'
> {
    /** Heading of the dialog, which also labels it. */
    title: ReactNode;
    /** Content, or a function that gets `close()`. */
    children?: ReactNode | ((close: () => void) => ReactNode);
    /**
     * More content in the header, between the title and the close button: a switcher, a few
     * actions. On phones, it goes under the title. A function gets `close()`.
     */
    headerContent?: ReactNode | ((close: () => void) => ReactNode);
    /** Buttons at the bottom, or a function that gets `close()`. */
    footer?: ReactNode | ((close: () => void) => ReactNode);
    /**
     * Closes on a click outside and shows a close button. Defaults to true. Turn it off for dialogs
     * that need an answer.
     */
    isDismissable?: boolean;
    /** `alertdialog` for confirmations and interruptions. Defaults to `dialog`. */
    role?: 'dialog' | 'alertdialog';
    /** Maximum width: `sm`, `md` (the default), `lg`, or `xl` for pickers and editors. */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /**
     * On phones, takes the whole screen instead of opening as a sheet at the bottom: for dialogs
     * that need all the room they can get, such as pickers.
     */
    fullScreenOnPhone?: boolean;
    className?: string;
    overlayClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
    /**
     * Hides the dialog for a moment while it stays open: its content keeps its state, and the page
     * around it is no longer inert, so that a window opened from the dialog, which a script adds to
     * the page (a file picker, a payment form of another site), can take the focus and the clicks.
     * The dialog comes back, as it was, when it is no longer suspended.
     */
    isSuspended?: boolean;
}

/**
 * A modal dialog. Controlled with `isOpen` and `onOpenChange`, or inside a `DialogTrigger` with
 * its button as the first child. It traps focus, closes with Escape, and returns focus when it
 * closes; `isSuspended` hides it for a moment, as it was. On phones, it opens as a sheet at the bottom of the screen, or takes the whole screen with
 * `fullScreenOnPhone`.
 */
export function Dialog({
    title,
    children,
    headerContent,
    footer,
    isDismissable = true,
    role = 'dialog',
    size = 'md',
    fullScreenOnPhone = false,
    className,
    overlayClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    isSuspended = false,
    ...props
}: DialogProps) {
    const intl = usePanneauIntl();
    const container = usePortalContainer();
    if (container === null) {
        return null;
    }
    return (
        // Hidden, the overlay keeps the state of its content and runs none of its effects: those
        // that make the page inert, trap the focus and close it on a click outside
        <Activity mode={isSuspended ? 'hidden' : 'visible'}>
            <ModalOverlay
                {...props}
                isDismissable={isDismissable}
                className={cx(styles.overlay, overlayClassName)}
                UNSTABLE_portalContainer={container}
            >
                <Modal
                    className={cx(
                        styles.modal,
                        styles[size],
                        fullScreenOnPhone && styles.fullScreenOnPhone,
                    )}
                >
                    {/* React bubbles events through portals to the components around the dialog: a
                    form in the dialog must not submit a form of the page (#146). */}
                    <div className={styles.boundary} onSubmit={stopPropagation}>
                        <AriaDialog
                            role={role}
                            className={cx('panneau-dialog', styles.dialog, className)}
                        >
                            {({ close }) => (
                                <>
                                    <div className={cx(styles.header, headerClassName)}>
                                        <Heading slot="title" className={styles.title}>
                                            {title}
                                        </Heading>
                                        {headerContent !== undefined && headerContent !== null ? (
                                            <div className={styles.headerContent}>
                                                {typeof headerContent === 'function'
                                                    ? headerContent(close)
                                                    : headerContent}
                                            </div>
                                        ) : null}
                                        {isDismissable ? (
                                            <IconButton
                                                icon={X}
                                                size="sm"
                                                label={intl.formatMessage(messages.close)}
                                                showTooltip={false}
                                                onPress={close}
                                            />
                                        ) : null}
                                    </div>
                                    <div className={cx(styles.body, bodyClassName)}>
                                        {typeof children === 'function'
                                            ? children(close)
                                            : children}
                                    </div>
                                    {footer !== undefined && footer !== null ? (
                                        <div className={cx(styles.footer, footerClassName)}>
                                            {typeof footer === 'function' ? footer(close) : footer}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </AriaDialog>
                    </div>
                </Modal>
            </ModalOverlay>
        </Activity>
    );
}

export { DialogTrigger } from 'react-aria-components';
