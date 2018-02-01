const messageWithValues = (messageDescriptor, values) => ({
    ...messageDescriptor,
    values: {
        ...values,
    },
});

export default messageWithValues;
