import isString from 'lodash/isString';

const messageWithValues = (messageDescriptor, values) =>
    (isString(messageDescriptor)
        ? messageDescriptor
        : {
            ...messageDescriptor,
            values: {
                ...values,
            },
        });

export default messageWithValues;
