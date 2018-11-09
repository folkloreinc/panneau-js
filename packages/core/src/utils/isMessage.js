import isObject from 'lodash/isObject';

const isMessage = str => isObject(str) && typeof str.id !== 'undefined';

export default isMessage;
