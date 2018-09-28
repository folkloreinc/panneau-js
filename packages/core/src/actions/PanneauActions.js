/**
 * Constants
 */
const SET_DEFINITION = 'panneau@SET_DEFINITION';
const SET_COMPONENTS_COLLECTION = 'panneau@SET_COMPONENTS_COLLECTION';

/**
 * Actions creator
 */
const setDefinition = definition => ({
    type: SET_DEFINITION,
    payload: definition,
});

const setComponentsCollection = collection => ({
    type: SET_COMPONENTS_COLLECTION,
    payload: collection,
});

export {
    SET_DEFINITION,
    SET_COMPONENTS_COLLECTION,
    setDefinition,
    setComponentsCollection,
};
