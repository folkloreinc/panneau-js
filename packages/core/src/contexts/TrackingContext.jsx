/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TrackingContainer, TrackingContext } from '@folklore/tracking';

import { Tracking, PropTypes as MicromagPropTypes } from '../lib';

export { TrackingContext };

export const useTracking = () => useContext(TrackingContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    variables: MicromagPropTypes.trackingVariables,
};

const defaultProps = {
    variables: null,
};

export const TrackingProvider = ({ variables, children }) => {
    const contextTracking = useTracking() || null;
    const tracking = useMemo(
        () => {
            if (contextTracking !== null) {
                contextTracking.setVariables(variables);
                return contextTracking;
            }
            return new Tracking({
                variables,
            });
        },
        [contextTracking, variables],
    );

    return <TrackingContainer tracking={tracking}>{children}</TrackingContainer>;
};

TrackingProvider.propTypes = propTypes;
TrackingProvider.defaultProps = defaultProps;
