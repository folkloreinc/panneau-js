/* eslint-disable react/jsx-props-no-spreading */
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import * as AppPropTypes from '../../../lib/PropTypes';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    resource: PanneauPropTypes.resource,
    size: PanneauPropTypes.buttonSize,
    item: PanneauPropTypes.item.isRequired,
    actions: PropTypes.arrayOf(PropTypes.string),
    iconsOnly: PropTypes.bool,
    showLabel: PropTypes.node,
    editLabel: PropTypes.node,
    deleteLabel: PropTypes.node,
    onClickShow: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    actions: [/* 'show', */ 'edit', 'delete'],
    size: 'sm',
    iconsOnly: true,
    showLabel: <FormattedMessage defaultMessage="Show" description="Button label" />,
    editLabel: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    deleteLabel: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    onClickShow: null,
    onClickEdit: null,
    onClickDelete: null,
    className: null,
};

const FormActions = ({
    resource,
    size,
    item,
    actions,
    iconsOnly,
    showLabel,
    editLabel,
    deleteLabel,
    onClickShow,
    onClickEdit,
    onClickDelete,
    className,
}) => {
    const urlGenerator = useResourceUrlGenerator(resource);
    const { id } = item || {};
    return (
        <Buttons
            size={size}
            items={[
                {
                    id: 'show',
                    label: iconsOnly ? <FontAwesomeIcon icon={faEye} /> : showLabel,
                    href:
                        urlGenerator !== null
                            ? urlGenerator('show', {
                                  id,
                              })
                            : null,
                    theme: 'info',
                    onClick: onClickShow,
                },
                {
                    id: 'edit',
                    label: iconsOnly ? <FontAwesomeIcon icon={faEdit} /> : editLabel,
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
                    label: iconsOnly ? <FontAwesomeIcon icon={faTrash} /> : deleteLabel,
                    href:
                        urlGenerator !== null
                            ? urlGenerator('delete', {
                                  id,
                              })
                            : null,
                    theme: 'danger',
                    onClick: onClickDelete,
                },
            ].filter(({ id: actionId }) => actions.indexOf(actionId) !== -1)}
            outline
            className={className}
        />
    );
};

FormActions.propTypes = propTypes;
FormActions.defaultProps = defaultProps;

export default FormActions;
