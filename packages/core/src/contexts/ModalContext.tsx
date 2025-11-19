/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ModalData {
    id: string;
    onClose?: (() => void) | null;
    [key: string]: unknown;
}

interface ModalContextValue {
    modals: ModalData[];
    container: unknown | null;
    setContainer: (container: unknown) => void;
    register: (id: string, data?: Record<string, unknown> | null) => void;
    unregister: (id?: string | null, data?: Record<string, unknown> | null) => void;
    closeLastModal: () => void;
    getModalById: (modalId: string) => ModalData | null;
}

export const ModalContext = React.createContext<ModalContextValue | null>(null);

export const useModal = (): ModalContextValue => useContext(ModalContext) || ({} as ModalContextValue);

interface ModalProviderProps {
    children: ReactNode;
    container?: unknown | null;
}

const DEFAULT_MODALS: ModalData[] = [];

function ModalProvider({ children, container: initialContainer = null }: ModalProviderProps) {
    const [container, setContainer] = useState(initialContainer);
    const [modals, setModals] = useState<ModalData[]>(DEFAULT_MODALS);
    const modalsRef = useRef(modals);

    const register = useCallback(
        (id: string, data: Record<string, unknown> | null = null) => {
            const { current: currentModals = [] } = modalsRef;
            const newModals = [
                ...currentModals,
                {
                    id,
                    ...data,
                },
            ];
            setModals(newModals);
            modalsRef.current = newModals;
        },
        [setModals],
    );

    const unregister = useCallback(
        (id: string | null = null, data: Record<string, unknown> | null = null) => {
            const { current: currentModals = [] } = modalsRef;
            const foundIndex = currentModals.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const { onClose = null } = data || {};
                if (onClose !== null) {
                    onClose();
                }
                const newModals = currentModals.filter(({ id: modalId }) => modalId !== id);
                setModals(newModals);
                modalsRef.current = newModals;
            }
        },
        [setModals],
    );

    const closeLastModal = useCallback(() => {
        const lastModal = modals.pop() || null;
        if (lastModal !== null) {
            const { id: lastModalId = null, onClose = null } = lastModal || {};
            if (onClose !== null) {
                onClose();
            }
            const newModals = modals.filter(({ id: modalId }) => modalId !== lastModalId);
            setModals(newModals);
            modalsRef.current = newModals;
        }
    }, [modals, setModals]);

    const getModalById = useCallback(
        (modalId: string) => (modals || []).find((modal) => modal?.id === modalId) || null,
        [modals],
    );

    const value = useMemo(
        () => ({
            modals,
            container,
            setContainer,
            register,
            unregister,
            closeLastModal,
            getModalById,
        }),
        [modals, container, setContainer, register, unregister, closeLastModal, getModalById],
    );

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export { ModalProvider };
