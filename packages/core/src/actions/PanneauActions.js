/**
 * Constants
 */
const SET_DEFINITION = 'panneau@SET_DEFINITION';
const SET_FIELDS_COLLECTION = 'panneau@SET_FIELDS_COLLECTION';
const SET_LAYOUTS_COLLECTION = 'panneau@SET_LAYOUTS_COLLECTION';

/**
 * Actions creator
 */
const setDefinition = definition => ({
    type: SET_DEFINITION,
    payload: definition,
});

const setFieldsCollection = collection => ({
    type: SET_FIELDS_COLLECTION,
    payload: collection,
});

const setLayoutsCollection = collection => ({
    type: SET_LAYOUTS_COLLECTION,
    payload: collection,
});

export {
    SET_DEFINITION,
    SET_FIELDS_COLLECTION,
    SET_LAYOUTS_COLLECTION,
    setDefinition,
    setFieldsCollection,
    setLayoutsCollection,
};
