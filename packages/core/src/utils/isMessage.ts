import isObject from 'lodash/isObject';

import type { Message } from '../types';

const isMessage = (message: unknown): message is Message =>
    isObject(message) && typeof (message as Message).defaultMessage !== 'undefined';

export default isMessage;
