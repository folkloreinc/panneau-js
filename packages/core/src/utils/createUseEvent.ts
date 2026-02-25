import { useEffect } from 'react';

interface EventsManager {
    subscribe: (event: string, callback: (...args: unknown[]) => void) => void;
    unsubscribe: (event: string, callback: (...args: unknown[]) => void) => void;
}

function createUseEvent(
    eventsManager: EventsManager | null,
): (event: string, callback: (...args: unknown[]) => void, enabled?: boolean) => void {
    return function useEvent(
        event: string,
        callback: (...args: unknown[]) => void,
        enabled: boolean = true,
    ): void {
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
}

export default createUseEvent;
