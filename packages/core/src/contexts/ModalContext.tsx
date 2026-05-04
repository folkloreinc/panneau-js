import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface ModalData {
    id: string;
    requestClose?: (() => void) | null;
    withoutBackdrop?: boolean;
    [key: string]: unknown;
}

export interface ModalContextValue {
    modals: ModalData[];
    container: unknown | null;
    setContainer: (container: unknown) => void;
    register: (id: string, data?: Record<string, unknown> | null) => void;
    unregister: (id?: string | null) => void;
    closeModal: (id: string) => void;
    closeLastModal: () => void;
    getModalById: (modalId: string) => ModalData | null;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
    return useContext(ModalContext) || ({} as ModalContextValue);
}

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
        (id: string | null = null) => {
            const { current: currentModals = [] } = modalsRef;
            const foundIndex = currentModals.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const newModals = currentModals.filter(({ id: modalId }) => modalId !== id);
                setModals(newModals);
                modalsRef.current = newModals;
            }
        },
        [setModals],
    );

    const closeModal = useCallback(
        (id: string) => {
            const { requestClose = null } = modals.find(({ id: modalId }) => modalId === id) || {};
            if (requestClose !== null) {
                requestClose();
            }
        },
        [modals, setModals],
    );

    const closeLastModal = useCallback(() => {
        const { requestClose = null } =
            modals !== null && modals.length > 0 ? modals[modals.length - 1] || {} : {};
        if (requestClose !== null) {
            requestClose();
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
            closeModal,
            closeLastModal,
            getModalById,
        }),
        [
            modals,
            container,
            setContainer,
            register,
            unregister,
            closeModal,
            closeLastModal,
            getModalById,
        ],
    );

    return <ModalContext value={value}>{children}</ModalContext>;
}

export { ModalProvider };
