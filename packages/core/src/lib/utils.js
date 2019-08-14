import isString from 'lodash/isString';
import isObject from 'lodash/isObject';

export const getLocalizedName = (definition, variant = 'default') => {
    const { name, messages = {} } = definition;
    const { name: nameMessages = {} } = messages;
    if (isString(nameMessages)) {
        return nameMessages;
    }
    return nameMessages[variant] || name;
};

export const isMessage = str => isObject(str) && typeof str.id !== 'undefined';
