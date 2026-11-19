import classNames from 'classnames';
import { type ReactNode, useCallback, useEffect, useId, useMemo, useState } from 'react';

import { useModal } from '@panneau/core/contexts';

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

    // <Modals> renders a single backdrop under all the modals, so a modal opened over another one
    // with a backdrop (ex.: a confirmation over a form) needs its own to dim the modal under it
    const { modals = null } = useModal();
    const modalIndex = (modals || []).findIndex(({ id: modalId }) => modalId === finalId);
    const modalsUnder = modalIndex !== -1 ? (modals || []).slice(0, modalIndex) : modals || [];
    const withStackedBackdrop =
        !withoutBackdrop &&
        modalsUnder.some(
            ({ withoutBackdrop: modalWithoutBackdrop = false }) => !modalWithoutBackdrop,
        );
    const data = useMemo(
        () => ({
            title,
            withoutBackdrop,
            requestClose: !withoutTransition
                ? requestClose
                : () => {
                      if (requestClose !== null) {
                          requestClose();
                      }
                      if (onClosed !== null) {
                          onClosed();
                      }
                  },
        }),
        [title, withoutBackdrop, withoutTransition, requestClose, onClosed],
    );
    const [mounted, setMounted] = useState(visible);
    const [show, setShow] = useState(false);
    const finalMounted = mounted || (withoutTransition && visible);
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        if (visible) {
            setMounted(true);
            timeout = setTimeout(() => {
                setShow(true);
            }, 1);
        } else {
            setShow(false);
            if (withoutTransition) {
                // No transitionend event will fire, so unmount right away
                setMounted(false);
            }
        }
        return () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [visible, withoutTransition]);

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
                aria-modal="true"
                role="dialog"
                tabIndex={-1}
                onTransitionEnd={onTransitionEnd}
            >
                {withStackedBackdrop ? (
                    // Under the content of the modal, faded in and out with it
                    <div className="modal-backdrop show z-n1" />
                ) : null}
                {children}
            </div>
        </ModalPortal>
    ) : null;
}

export default Modal;
