import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useModal } from '@panneau/core/contexts';
import { KEYCODES, useKeyboardKeys } from '@panneau/core/hooks';

interface ModalsProps {
    closeOnEscape?: boolean;
    className?: string | null;
}

function Modals({ closeOnEscape = false, className = null }: ModalsProps) {
    const { modals = null, setContainer = null, closeLastModal = null } = useModal();

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (setContainer !== null) {
            setContainer(containerRef.current);
        }
    }, [setContainer]);

    const hasModal = modals !== null && modals.length > 0;

    useEffect(() => {
        if (hasModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    }, [modals]);

    useKeyboardKeys(
        closeOnEscape
            ? {
                  [KEYCODES.ESCAPE]: closeLastModal,
              }
            : {},
    );

    const hasModalWithBackdrop = (modals || []).reduce(
        (withBackdrop, { withoutBackdrop = false }) => withBackdrop || !withoutBackdrop,
        false,
    );

    const [backdropMounted, setBackdropMounted] = useState(hasModalWithBackdrop);
    const [showBackdrop, setShowBackdrop] = useState(hasModalWithBackdrop);
    const onTransitionEnd = useCallback(
        (e) => {
            if (!hasModalWithBackdrop && e.target === e.currentTarget) {
                setBackdropMounted(false);
            }
        },
        [hasModalWithBackdrop],
    );

    useEffect(() => {
        if (hasModalWithBackdrop) {
            setBackdropMounted(true);
            setTimeout(() => {
                setShowBackdrop(true);
            }, 1);
        } else {
            setShowBackdrop(false);
        }
    }, [hasModalWithBackdrop]);

    return (
        <div className={classNames(['position-static', className])}>
            <div ref={containerRef} />
            {backdropMounted ? (
                <div
                    className={classNames('modal-backdrop fade', {
                        show: showBackdrop,
                    })}
                    onTransitionEnd={onTransitionEnd}
                />
            ) : null}
        </div>
    );
}

export default Modals;
