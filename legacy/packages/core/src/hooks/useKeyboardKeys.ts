import { useEffect } from 'react';

export const KEYCODES = {
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    ESCAPE: 27,
    SPACE: 32,
};

interface UseKeyboardKeysOptions {
    eventName?: string;
}

function useKeyboardKeys(
    keys: Record<number, (e: KeyboardEvent) => void> = {},
    { eventName = 'keydown' }: UseKeyboardKeysOptions = {},
): void {
    const keysNames = Object.keys(keys);
    const keysListeners = keysNames.map((key) => keys[key]);
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const { keyCode } = e;
            if (typeof keys[keyCode] !== 'undefined') {
                keys[keyCode](e);
            }
        };
        document.addEventListener(eventName, onKeyDown);
        return () => {
            document.removeEventListener(eventName, onKeyDown);
        };
    }, [...keysNames, ...keysListeners, eventName]);
}

export default useKeyboardKeys;
