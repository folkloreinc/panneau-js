import React from 'react';
import addons, { makeDecorator } from '@storybook/addons';
import LayoutGrid from '../../components/LayoutGrid';

import { ADDON_ID, PARAM_KEY } from './register';

export default makeDecorator({
    name: 'withLayoutGrid',
    parameterName: PARAM_KEY,
    skipIfNoParametersOrOptions: true,
    wrapper: (getStory, context, { parameters: layouts, ...rest }) => {
        const { name, parameters } = context;
        const { withScreenLayoutGrid = name === 'Placeholders' } = parameters;
        return withScreenLayoutGrid ? (
            <LayoutGrid layouts={layouts}>
                {layout =>
                    getStory({
                        ...context,
                        screenLayout: layout,
                    })
                }
            </LayoutGrid>
        ) : (
            getStory(context)
        );
    },
});
