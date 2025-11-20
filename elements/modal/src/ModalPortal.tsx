import { type ReactNode, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { useModal } from '@panneau/core/contexts';

interface ModalPortalProps {
    id?: string | null;
    data?: Record<string, unknown> | null;
    children?: ReactNode | null;
}

function ModalPortal({ id = null, data = null, children = null }: ModalPortalProps) {
    const { container = null, register = null, unregister = null } = useModal();
    const finalId = useMemo(() => (id !== null ? id : `modal-${new Date().getTime()}`), [id]);

    useEffect(() => {
        if (register !== null) {
            register(finalId, data);
        }
        return () => {
            if (unregister !== null) {
                unregister(finalId, data);
            }
        };
    }, [finalId, data, register, unregister]);

    return container !== null ? ReactDOM.createPortal(children, container) : null;
}

export default ModalPortal;
