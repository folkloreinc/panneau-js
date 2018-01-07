import {
    SET_DEFINITION,
    SET_FIELDS_COLLECTION,
    SET_LAYOUTS_COLLECTION,
} from '../actions/PanneauActions';

const initialState = {
    definition: null,
    layoutsCollection: null,
    fieldsCollection: null,
};

const PanneauReducer = (previousState, action) => {
    const state = {
        ...initialState,
        ...(previousState || null),
    };

    switch (action.type) {
    case SET_DEFINITION: {
        return {
            ...state,
            definition: {
                ...action.payload,
            },
        };
    }
    case SET_FIELDS_COLLECTION: {
        return {
            ...state,
            fieldsCollection: action.payload,
        };
    }
    case SET_LAYOUTS_COLLECTION: {
        return {
            ...state,
            layoutsCollection: action.payload,
        };
    }
    default: {
        return state;
    }
    }
};

export default PanneauReducer;
