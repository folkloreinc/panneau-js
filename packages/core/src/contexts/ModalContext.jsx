/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

// import { getDisplayName } from '../utils';

export const ModalContext = React.createContext(null);

export const useModal = () => useContext(ModalContext) || {};

const propTypes = {
    children: PropTypes.node.isRequired,
    container: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    container: null,
};

export const ModalProvider = ({ children, container: initialContainer }) => {
    const [container, setContainer] = useState(initialContainer);
    const [modals, setModals] = useState([]);
    const modalsRef = useRef(modals);

    const register = useCallback(
        (id, data = null) => {
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
        [modals, setModals],
    );

    const unregister = useCallback(
        (id = null) => {
            const { current: currentModals = [] } = modalsRef;
            const foundIndex = currentModals.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const newModals = currentModals.filter(({ id: modalId }) => modalId !== id);
                setModals(newModals);
                modalsRef.current = newModals;
            }
        },
        [modals, setModals],
    );

    const closeLastModal = useCallback(() => {
        const lastModal = modals.pop() || null;
        if (lastModal !== null) {
            const { id: lastModalId = null } = lastModal || {};
            const newModals = modals.filter(({ id: modalId }) => modalId !== lastModalId);
            setModals(newModals);
            modalsRef.current = newModals;
        }
    }, [modals, setModals]);

    const getModalByKey = useCallback(
        (key) => (modals || []).find((modal) => modal?.id === key) || null,
        [modals],
    );

    const modalIsOpen = useCallback((key) => getModalByKey(key) !== null, [getModalByKey]);

    const value = useMemo(
        () => ({
            modals,
            container,
            setContainer,
            register,
            unregister,
            closeLastModal,
            getModalByKey,
            modalIsOpen,
        }),
        [
            modals,
            container,
            setContainer,
            register,
            unregister,
            closeLastModal,
            getModalByKey,
            modalIsOpen,
        ],
    );

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

ModalProvider.propTypes = propTypes;
ModalProvider.defaultProps = defaultProps;
