import React, { useState } from 'react';
import { addons, types } from '@storybook/addons';
import { useParameter, useAddonState } from '@storybook/api';
import { Separator, IconButton, WithTooltip, Icons, TooltipLinkList } from '@storybook/components';

export const ADDON_ID = 'screen_layouts';
export const PARAM_KEY = 'screenLayouts';

const LayoutsButton = () => {
    const layouts = useParameter(PARAM_KEY, []);
    const [state, setState] = useAddonState(ADDON_ID, {
        layout: layouts.length > 0 ? layouts[0] : null,
    });
    const items = layouts.map((it) => ({
        id: it,
        title: it,
        onClick: () =>
            setState({
                ...state,
                layout: it,
            }),
    }));
    return (
        <>
            <Separator />
            <WithTooltip
                placement="top"
                trigger="click"
                tooltip={({ onHide }) => <TooltipLinkList links={items} />}
                closeOnClick
            >
                <IconButton title="Change the screen layout">
                    <Icons icon="grow" />
                </IconButton>
            </WithTooltip>
        </>
    );
};

addons.register(ADDON_ID, (api) => {
    addons.add(ADDON_ID, {
        type: types.TOOL,
        title: 'Screen layouts',
        match: ({ viewMode }) => viewMode === 'story',
        render: () => <LayoutsButton />,
    });
});
