const messageWithValues = (messageDescriptor, values) => (
    Object.assign(messageDescriptor, {
        values,
    })
);

export default messageWithValues;
