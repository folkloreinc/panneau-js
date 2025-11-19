import isObject from 'lodash-es/isObject';
import type { Message } from '@panneau/core/types';

const isMessage = (message: unknown): message is Message =>
    isObject(message) && typeof (message as Message).defaultMessage !== 'undefined';

export default isMessage;
