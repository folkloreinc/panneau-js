import isObject from 'lodash-es/isObject';

import type { Message } from '../types';

function isMessage(message: unknown): message is Message {
    return (
        isObject(message) &&
        (typeof (message as Message).defaultMessage !== 'undefined' ||
            typeof (message as Message).id !== 'undefined')
    );
}

export default isMessage;
