import { X } from 'lucide-react';
import type { ReactNode } from 'react';
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
}

/**
 * A modal dialog. Controlled with `isOpen` and `onOpenChange`, or inside a `DialogTrigger` with
 * its button as the first child. It traps focus, closes with Escape, and returns focus when it
 * closes. On phones, it opens as a sheet at the bottom of the screen, or takes the whole screen with
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
    ...props
}: DialogProps) {
    const intl = usePanneauIntl();
    const container = usePortalContainer();
    if (container === null) {
        return null;
    }
    return (
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
                <AriaDialog role={role} className={cx('panneau-dialog', styles.dialog, className)}>
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
                                {typeof children === 'function' ? children(close) : children}
                            </div>
                            {footer !== undefined && footer !== null ? (
                                <div className={cx(styles.footer, footerClassName)}>
                                    {typeof footer === 'function' ? footer(close) : footer}
                                </div>
                            ) : null}
                        </>
                    )}
                </AriaDialog>
            </Modal>
        </ModalOverlay>
    );
}

export { DialogTrigger } from 'react-aria-components';
