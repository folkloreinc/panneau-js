import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { useModal } from '@panneau/core/contexts';
import { KEYCODES, useKeyboardKeys } from '@panneau/core/hooks';

import styles from './styles.module.css';

interface ModalsProps {
    theme?: string | null;
    className?: string | null;
}

function Modals({ theme = null, className = null }: ModalsProps) {
    const { modals = null, setContainer = null, closeLastModal = null } = useModal();

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (setContainer !== null) {
            setContainer(containerRef.current);
        }
    }, [setContainer]);

    useEffect(() => {
        if (document.body) {
            if (modals !== null && modals.length > 0) {
                document.body.className = 'modal-open';
            } else {
                document.body.className = '';
            }
        }
    }, [modals]);

    useKeyboardKeys({
        [KEYCODES.ESCAPE]: closeLastModal,
    });

    return (
        <div
            className={classNames([
                styles.modalsContainer,
                {
                    [className!]: className !== null,
                },
            ])}
            data-bs-theme={theme !== null ? theme : undefined}
            style={{ color: theme === 'dark' ? '#FFF' : undefined }}
        >
            <div
                className={classNames([
                    styles.modals,
                    {
                        [styles.hasModals]: modals !== null && modals.length > 0,
                    },
                ])}
                ref={containerRef}
            />
        </div>
    );
}

export default Modals;
