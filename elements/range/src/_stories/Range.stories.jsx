import React, { useCallback, useState } from 'react';

import RangeElement from '../Range';

export default {
    component: RangeElement,
    title: 'Elements/Range',
    parameters: {
        intl: true,
    },
};

export const Normal = () => {
    const [valueOne, setValueOne] = useState(50);
    const [valueTwo, setValueTwo] = useState(5);

    const changeValue = useCallback((value) => {
        setValueOne(value);
    }, []);

    const changeValueTwo = useCallback((value) => {
        setValueTwo(value);
    }, []);

    return (
        <div>
            <div>
                <RangeElement title="Un sélecteur" onChange={changeValue} value={valueOne} />
                <div>{valueOne}</div>
            </div>
            <div>
                <RangeElement
                    title="Un sélecteur avec des paliers"
                    onChange={changeValueTwo}
                    value={valueTwo}
                    max={10}
                />
                <div>{valueTwo}</div>
            </div>
        </div>
    );
};
