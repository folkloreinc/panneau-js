import { type ReactNode, useEffect, useMemo, useRef } from 'react';
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
    const dataRef = useRef(data);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        if (register !== null) {
            register(finalId, dataRef.current);
        }
        return () => {
            if (unregister !== null) {
                unregister(finalId);
            }
        };
    }, [finalId, register, unregister]);

    return container !== null ? ReactDOM.createPortal(children, container) : null;
}

export default ModalPortal;
