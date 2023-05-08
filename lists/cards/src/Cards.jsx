/* eslint-disable react/jsx-props-no-spreading */
// import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import { useDisplaysComponents } from '@panneau/core/contexts';
// import { getColumnsWithFields, getComponentFromName } from '@panneau/core/utils';
import Card from '@panneau/element-card';
import FormActions from '@panneau/element-item-actions';
import Loading from '@panneau/element-loading';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    loading: PropTypes.bool,
    columns: PanneauPropTypes.tableColumns,
    // onQueryChange: PropTypes.func,
};

const defaultProps = {
    items: [],
    loading: false,
    columns: null,
};

const CardsList = ({
    resource,
    items,
    loading,
    columns,
    // onQueryChange,
}) => {
    console.log(columns);
    // const displayComponents = useDisplaysComponents();

    // const columnsWithFields = useMemo(
    //     () => getColumnsWithFields(resource, columns),
    //     [resource, columns],
    // );

    // const hasIdColumn =
    //     (columnsWithFields.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    // const actionColumn = (columnsWithFields || []).find((it) => it.id === 'actions') || null;
    // const hasActionsColumn = actionColumn !== null;

    return (
        // const columns = fields.filter(({ hidden_in_index: hiddenInIndex = false }) => !hiddenInIndex);
        <div className="d-flex flex-wrap">
            {items !== null
                ? items.map((it) => {
                      const { id = null } = it || {};
                      return (
                          <div className="w-50 p-2" key={`card-${id}`}>
                              <Card header={<div className="d-flex" />}>
                                  <FormActions
                                      resource={resource}
                                      item={it}
                                      // actions={[{ label: 'Edit', theme: 'primary' }]}
                                  />
                              </Card>
                          </div>
                      );
                  })
                : null}
            {loading ? <Loading /> : null}
        </div>
    );
};
CardsList.propTypes = propTypes;
CardsList.defaultProps = defaultProps;

export default CardsList;
