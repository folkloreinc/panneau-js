/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { defineMessages } from 'react-intl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// import * as AppPropTypes from '../../../lib/PropTypes';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';

const defaultMessages = defineMessages({
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
    iconsOnly: PropTypes.bool,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    urlGenerator: PropTypes.func,
    messages: PanneauPropTypes.messages,
    className: PropTypes.string,
};

const defaultProps = {
    size: 'sm',
    iconsOnly: true,
    onClickEdit: null,
    onClickDelete: null,
    urlGenerator: null,
    messages: defaultMessages,
    className: null,
};

const FormActions = ({
    size,
    item,
    iconsOnly,
    onClickEdit,
    onClickDelete,
    urlGenerator,
    messages,
    className,
}) => {
    const { id } = item || {};

    return (
        <Buttons
            size={size}
            items={[
                {
                    id: 'edit',
                    label: iconsOnly ? (
                        <FontAwesomeIcon icon={faEye} />
                    ) : (
                        <Label {...messages.show} />
                    ),
                    href:
                        urlGenerator !== null
                            ? urlGenerator('show', {
                                  id,
                              })
                            : null,
                    theme: 'info',
                },
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
                    onClick: onClickEdit,
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

FormActions.propTypes = propTypes;
FormActions.defaultProps = defaultProps;

export default FormActions;
