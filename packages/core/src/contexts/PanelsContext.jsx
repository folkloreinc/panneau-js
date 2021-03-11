/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { getDisplayName } from '../utils';

export const PanelsContext = React.createContext({
    container: null,
});

export const usePanels = () => useContext(PanelsContext) || {};

export const withPanels = (WrappedComponent) => {
    const WithPanelsComponent = (props) => (
        <PanelsContext.Consumer>
            {({ panels, setContainer, container, register, unregister }) => (
                <WrappedComponent
                    panelsContainer={container}
                    setPanelsContainer={setContainer}
                    panels={panels}
                    registerPanel={register}
                    unregisterPanel={unregister}
                    {...props}
                />
            )}
        </PanelsContext.Consumer>
    );
    WithPanelsComponent.displayName = `WithPanels(${getDisplayName(WrappedComponent)})`;
    return WithPanelsComponent;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    container: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    container: null,
};

export const PanelsProvider = ({ children, container: initialContainer }) => {
    const [container, setContainer] = useState(initialContainer);
    const [panels, setPanels] = useState([]);
    const panelsRef = useRef(panels);
    const register = useCallback(
        (id, data = null) => {
            const { current: currentPanels } = panelsRef;
            const newPanels = [
                ...currentPanels,
                {
                    id,
                    ...data,
                },
            ];
            setPanels(newPanels);
            panelsRef.current = newPanels;
        },
        [panels, setPanels],
    );
    const unregister = useCallback(
        (id) => {
            const { current: currentPanels } = panelsRef;
            const foundIndex = currentPanels.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const newPanels = currentPanels.filter(({ id: modalId }) => modalId !== id);
                setPanels(newPanels);
                panelsRef.current = newPanels;
            }
        },
        [panels, setPanels],
    );
    return (
        <PanelsContext.Provider value={{ panels, setContainer, container, register, unregister }}>
            {children}
        </PanelsContext.Provider>
    );
};

PanelsProvider.propTypes = propTypes;
PanelsProvider.defaultProps = defaultProps;
