import {
    SET_DEFINITION,
    SET_COMPONENTS_COLLECTION,
} from '../actions/PanneauActions';

import parseDefinition from '../lib/parseDefinition';

const initialState = {
    definition: null,
    componentsCollection: null,
};

const PanneauReducer = (previousState = initialState, action) => {
    const state = previousState;

    switch (action.type) {
    case SET_DEFINITION: {
        return {
            ...state,
            definition: parseDefinition(action.payload),
        };
    }
    case SET_COMPONENTS_COLLECTION: {
        return {
            ...state,
            componentsCollection: action.payload,
        };
    }
    default: {
        return state;
    }
    }
};

export default PanneauReducer;
