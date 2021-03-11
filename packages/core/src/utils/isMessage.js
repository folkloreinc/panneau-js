import isObject from 'lodash/isObject';

const isMessage = message => isObject(message) && typeof message.defaultMessage !== 'undefined';

export default isMessage;
