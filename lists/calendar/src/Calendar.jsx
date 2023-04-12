/* eslint-disable react/jsx-props-no-spreading */
// import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import FormActions from '@panneau/element-item-actions';
import Loading from '@panneau/element-loading';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    loading: PropTypes.bool,
    // onQueryChange: PropTypes.func,
};

const defaultProps = {
    items: [],
    loading: false,
};

const CalendarList = ({
    resource,
    items,
    loading,
    // onQueryChange,
}) => (
    // const columns = fields.filter(({ hidden_in_index: hiddenInIndex = false }) => !hiddenInIndex);
    <div className="d-flex flex-wrap">
        {items !== null
            ? items.map((it) => {
                  const { id = null } = it || {};
                  return (
                      <div className="w-50 p-2" key={`card-${id}`}>
                          <FormActions
                              resource={resource}
                              item={it}
                              // actions={[{ label: 'Edit', theme: 'primary' }]}
                          />
                      </div>
                  );
              })
            : null}
        {loading ? <Loading /> : null}
    </div>
);
CalendarList.propTypes = propTypes;
CalendarList.defaultProps = defaultProps;

export default CalendarList;
