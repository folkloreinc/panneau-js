import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import classNames from 'classnames';
import isString from 'lodash/isString';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

const messages = defineMessages({
    empty: {
        id: 'list.empty',
        description: 'The text within the well that indicates that there are no items',
        defaultMessage: 'No items',
    },
});

const propTypes = {
    label: PanneauPropTypes.message,
};

const defaultProps = {
    label: messages.empty,
};

const ListEmpty = ({ label }) => (
    <div
        className={classNames({
            well: true,
            'well-sm': true,
            'text-center': true,
        })}
    >
        {isString(label) ? label : (
            <FormattedMessage {...label} />
        )}
    </div>
);

ListEmpty.propTypes = propTypes;
ListEmpty.defaultProps = defaultProps;

export default ListEmpty;
