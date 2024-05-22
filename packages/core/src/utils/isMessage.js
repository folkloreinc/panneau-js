import isObject from 'lodash-es/isObject';

const isMessage = (message) => isObject(message) && typeof message.defaultMessage !== 'undefined';

export default isMessage;
