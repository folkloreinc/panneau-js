import { useEffect } from 'react';

export const KEYCODES = {
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    ESCAPE: 27,
    SPACE: 32,
};

const useKeyboardKeys = (keys = {}, { eventName = 'keydown' } = {}) => {
    const keysNames = Object.keys(keys);
    const keysListeners = keysNames.map((key) => keys[key]);
    useEffect(() => {
        const onKeyDown = (e) => {
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
};

export default useKeyboardKeys;
