import classNames from 'classnames';
import { type ReactNode, useCallback, useEffect, useId, useMemo, useState } from 'react';

import ModalPortal from './ModalPortal';

export interface ModalProps {
    id?: string | null;
    title?: string | null;
    visible?: boolean;
    withoutTransition?: boolean;
    withoutBackdrop?: boolean;
    className?: string | null;
    children?: ReactNode | null;
    requestClose?: (() => void) | null;
    onClosed?: (() => void) | null;
}

function Modal({
    id = null,
    className = null,
    title = null,
    visible = true,
    withoutTransition = false,
    withoutBackdrop = false,
    requestClose = null,
    onClosed = null,
    children = null,
}: ModalProps) {
    const backupId = useId();
    const finalId = id || backupId;
    const data = useMemo(
        () => ({
            title,
            withoutBackdrop,
            requestClose: !withoutTransition
                ? requestClose
                : () => {
                      requestClose();
                      onClosed();
                  },
        }),
        [title, withoutBackdrop, withoutTransition, requestClose, onClosed],
    );
    const [mounted, setMounted] = useState(visible);
    const [show, setShow] = useState(false);
    const finalMounted = mounted || (withoutTransition && visible);
    useEffect(() => {
        if (visible) {
            setMounted(true);
            setTimeout(() => {
                setShow(true);
            }, 1);
        } else {
            setShow(false);
        }
    }, [visible]);

    const onTransitionEnd = useCallback(
        (e) => {
            if (e.target === e.currentTarget && !visible) {
                setMounted(false);
                if (onClosed !== null) {
                    onClosed();
                }
            }
        },
        [visible, onClosed],
    );

    return finalMounted ? (
        <ModalPortal id={finalId} data={data}>
            <div
                className={classNames([
                    'modal',
                    'd-block',
                    {
                        fade: !withoutTransition,
                        show: show || (visible && withoutTransition),
                    },
                    className,
                ])}
                aria-dialog="true"
                role="dialog"
                tabIndex={-1}
                onTransitionEnd={onTransitionEnd}
            >
                {children}
            </div>
        </ModalPortal>
    ) : null;
}

export default Modal;
