/* eslint-disable global-require */
const createStore = __DEV__ ? require('./createStore.dev').default : require('./createStore.prod').default;

export default createStore;
