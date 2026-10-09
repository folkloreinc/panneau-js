import { type ReactNode, useEffect, useId, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

import { useModal } from '@panneau/core/contexts';

interface ModalPortalProps {
    id?: string | null;
    data?: Record<string, unknown> | null;
    children?: ReactNode | null;
}

function ModalPortal({ id = null, data = null, children = null }: ModalPortalProps) {
    const { container = null, register = null, unregister = null } = useModal();
    const backupId = useId();
    const finalId = id || backupId;
    const dataRef = useRef(data);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        if (register !== null) {
            // Function values (and requestClose, which may be set later) are proxied through
            // the ref so the registry always calls the latest version, not the one at mount
            const currentData = dataRef.current || {};
            const registeredData = Object.keys(currentData).reduce(
                (acc: Record<string, unknown>, key: string) => ({
                    ...acc,
                    [key]:
                        typeof currentData[key] === 'function' || key === 'requestClose'
                            ? (...args: unknown[]) => {
                                  const latest = (dataRef.current || {})[key];
                                  return typeof latest === 'function' ? latest(...args) : undefined;
                              }
                            : currentData[key],
                }),
                {},
            );
            register(finalId, registeredData);
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
