import { TrackingContainer, TrackingContext } from '@folklore/tracking';
import { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import type { TrackingVariables } from '@panneau/core/types';

import { Tracking } from '../lib';

export { TrackingContext };

export const useTracking = (): any => useContext(TrackingContext);

interface TrackingProviderProps {
    children: ReactNode;
    variables?: TrackingVariables | null;
}

function TrackingProvider({ variables = null, children }: TrackingProviderProps) {
    const contextTracking = useTracking() || null;
    const tracking = useMemo(() => {
        if (contextTracking !== null) {
            contextTracking.setVariables(variables);
            return contextTracking;
        }
        return new Tracking({
            variables,
        });
    }, [contextTracking, variables]);

    return <TrackingContainer tracking={tracking}>{children}</TrackingContainer>;
}

export { TrackingProvider };
