/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { defineMessages } from 'react-intl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// import * as AppPropTypes from '../../../lib/PropTypes';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';

import { useResourceUrlGenerator } from '@panneau/core/hooks';

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
    resource: PanneauPropTypes.item.isRequired,
    item: PanneauPropTypes.item.isRequired,
    className: PropTypes.string,
    iconsOnly: PropTypes.bool,
    onClickDelete: PropTypes.func,
    urlGenerator: PropTypes.func,
};

const defaultProps = {
    size: 'sm',
    className: null,
    iconsOnly: true,
    onClickDelete: null,
    urlGenerator: null,
};

const Actions = ({ size, item, className, iconsOnly, onClickDelete, urlGenerator }) => {
    const { id } = item || {};

    return (
        <Buttons
            size={size}
            items={[
                {
                    id: 'edit',
                    label: iconsOnly ? (
                        <FontAwesomeIcon icon={faEdit} />
                    ) : (
                        <Label {...messages.edit} />
                    ),
                    href:
                        urlGenerator !== null
                            ? urlGenerator('edit', {
                                  id,
                              })
                            : null,
                    theme: 'primary',
                },
                {
                    id: 'delete',
                    label: iconsOnly ? (
                        <FontAwesomeIcon icon={faTrash} />
                    ) : (
                        <Label {...messages.delete} />
                    ),
                    href:
                        urlGenerator !== null
                            ? urlGenerator('delete', {
                                  id,
                              })
                            : null,
                    theme: 'danger',
                    onClick: onClickDelete,
                },
            ]}
            outline
            className={className}
        />
    );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;

export default Actions;
