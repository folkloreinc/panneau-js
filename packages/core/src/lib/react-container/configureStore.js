/* eslint-disable global-require */
const configureStore = process.env.NODE_ENV !== 'production' ? require('./configureStore.dev').default : require('./configureStore.prod').default;

export default configureStore;
