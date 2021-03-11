/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as MicromagPropTypes } from '../lib';

export const ScreenSizeContext = React.createContext({
    screen: null,
    screens: [],
    width: 0,
    height: 0,
    landscape: false,
});

export const useScreenSize = () => useContext(ScreenSizeContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    size: MicromagPropTypes.screenSize,
};

const defaultProps = {
    size: {},
};

// Note: this is done to avoid excessive renders on the screens that use the context

export const ScreenSizeProvider = ({ size, children }) => {
    const [currentSize, setSize] = useState(size);
    const { width: prevWidth, height: prevHeight } = currentSize;
    const { width: nextWidth, height: nextHeight } = size;
    useEffect(() => {
        if (prevWidth !== nextWidth || prevHeight !== nextHeight) {
            setSize(size);
        }
    }, [setSize, nextWidth, nextHeight, prevWidth, prevHeight, size]);
    return <ScreenSizeContext.Provider value={currentSize}>{children}</ScreenSizeContext.Provider>;
};

ScreenSizeProvider.propTypes = propTypes;
ScreenSizeProvider.defaultProps = defaultProps;
