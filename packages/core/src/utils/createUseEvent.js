import { useEffect } from 'react';

const createUseEvent =
    (eventsManager) =>
    (event, callback, enabled = true) => {
        useEffect(() => {
            if (enabled && eventsManager !== null) {
                eventsManager.subscribe(event, callback);
            }
            return () => {
                if (enabled && eventsManager !== null) {
                    eventsManager.unsubscribe(event, callback);
                }
            };
        }, [eventsManager, event, callback, enabled]);
    };

export default createUseEvent;
