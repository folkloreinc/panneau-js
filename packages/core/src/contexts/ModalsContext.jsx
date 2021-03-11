/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { getDisplayName } from '../utils';

export const ModalsContext = React.createContext({
    container: null,
});

export const useModals = () => useContext(ModalsContext) || {};

export const withModals = (WrappedComponent) => {
    const WithModalsComponent = (props) => (
        <ModalsContext.Consumer>
            {({ modals, container, setContainer, register, unregister }) => (
                <WrappedComponent
                    modalsContainer={container}
                    setModalsContainer={setContainer}
                    modals={modals}
                    registerModal={register}
                    unregisterModal={unregister}
                    {...props}
                />
            )}
        </ModalsContext.Consumer>
    );
    WithModalsComponent.displayName = `WithModals(${getDisplayName(WrappedComponent)})`;
    return WithModalsComponent;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    container: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    container: null,
};

export const ModalsProvider = ({ children, container: initialContainer }) => {
    const [container, setContainer] = useState(initialContainer);
    const [modals, setModals] = useState([]);
    const modalsRef = useRef(modals);
    const register = useCallback(
        (id, data = null) => {
            const { current: currentModals } = modalsRef;
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
        (id) => {
            const { current: currentModals } = modalsRef;
            const foundIndex = currentModals.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const newModals = currentModals.filter(({ id: modalId }) => modalId !== id);
                setModals(newModals);
                modalsRef.current = newModals;
            }
        },
        [modals, setModals],
    );
    return (
        <ModalsContext.Provider value={{ modals, container, setContainer, register, unregister }}>
            {children}
        </ModalsContext.Provider>
    );
};

ModalsProvider.propTypes = propTypes;
ModalsProvider.defaultProps = defaultProps;
