import isObject from 'lodash/isObject';

import type { Message } from '../types';

function isMessage(message: unknown): message is Message {
    return isObject(message) && typeof (message as Message).defaultMessage !== 'undefined';
}

export default isMessage;
