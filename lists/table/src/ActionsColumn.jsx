import React from 'react';
import PropTypes from 'prop-types';
import { ListActions } from '@panneau/list';

import * as TablePropTypes from './PropTypes';
import Column from './Column';

const propTypes = {
    column: TablePropTypes.column.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClickAction: PropTypes.func,
};

const defaultProps = {
    item: null,
    onClickAction: null,
};

const ActionsColumn = ({ item, column, onClickAction }) => {
    const {
        id,
        label,
        type,
        align,
        showAction = null,
        editAction = null,
        deleteAction = null,
        actions = null,
        ...props
    } = column;
    const actionsProps = {
        show: showAction,
        edit: editAction,
        delete: deleteAction,
    };
    // prettier-ignore
    const finalActions = [...(actions || ListActions.getDefaultActions())]
        .filter(action => (actionsProps[action.id] || null) !== false)
        .map(action => (
            (actionsProps[action.id] || null) !== null
                ? {
                    ...action,
                    ...actionsProps[action.id],
                }
                : action
        ));
    return (
        <Column align="right" {...column}>
            <ListActions item={item} onClick={onClickAction} actions={finalActions} {...props} />
        </Column>
    );
};

ActionsColumn.propTypes = propTypes;
ActionsColumn.defaultProps = defaultProps;

export default ActionsColumn;
