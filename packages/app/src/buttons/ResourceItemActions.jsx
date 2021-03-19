import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { defineMessages } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// import * as AppPropTypes from '../../../lib/PropTypes';
import { PanneauPropTypes } from '@panneau/core';
import { Buttons } from '@panneau/element-button';

import { useResourceUrlGenerator } from '../../../contexts/ResourceContext';

const messages = defineMessages({
    edit: {
        id: 'forms.edit_button',
        defaultMessage: 'Edit',
    },
    delete: {
        id: 'forms.delete_button',
        defaultMessage: 'Delete',
    },
});

const propTypes = {
    size: PanneauPropTypes.buttonSize,
    item: PanneauPropTypes.item.isRequired,
    className: PropTypes.string,
    iconsOnly: PropTypes.bool,
    onClickDelete: PropTypes.func,
};

const defaultProps = {
    size: 'xs',
    className: null,
    iconsOnly: false,
    onClickDelete: null,
};

const ResourceItemActions = ({ size, item, className, iconsOnly, onClickDelete }) => {
    const resourceRoute = useResourceUrlGenerator();
    const { id } = item;
    return (
        <Buttons
            size={size}
            items={[
                {
                    id: 'edit',
                    label: iconsOnly ? <FontAwesomeIcon icon={faEdit} /> : messages.edit,
                    href: resourceRoute('edit', {
                        id,
                    }),
                    theme: 'primary',
                },
                {
                    id: 'delete',
                    label: iconsOnly ? <FontAwesomeIcon icon={faTrash} /> : messages.delete,
                    href: resourceRoute('delete', {
                        id,
                    }),
                    theme: 'danger',
                    onClick: onClickDelete,
                },
            ]}
            outline
            className={className}
        />
    );
};

ResourceItemActions.propTypes = propTypes;
ResourceItemActions.defaultProps = defaultProps;

export default ResourceItemActions;
