/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes, isMessage } from '@panneau/core';
import { Button } from '@panneau/core/components';

import styles from '../../styles/partials/resource-index-header.scss';

const propTypes = {
    resource: PanneauPropTypes.definitions.resource.isRequired,
    title: PanneauPropTypes.label,
    showAddButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    getResourceActionUrl: PropTypes.func.isRequired,
};

const defaultProps = {
    title: null,
    showAddButton: true,
    addButtonLabel: null,
};

const ResourceIndexHeader = ({
    resource,
    showAddButton,
    title,
    addButtonLabel,
    getResourceActionUrl,
}) => {
    const {
        type: resourceType = 'default',
        messages: resourceMessages = {},
        types = [],
    } = resource;
    const isTyped = resourceType === 'typed';
    const resourceName = get(
        resourceMessages,
        'names.plural',
        get(resourceMessages, 'name', resource.name),
    );

    // Title
    const resourceTitle = get(resourceMessages, 'titles.resources.index', null);
    const defaultTitle = isMessage(title) ? (
        <FormattedMessage {...title} values={{ name: resourceName }} />
    ) : (
        title
    );

    // Add button
    const resourceAddButtonLabel = get(resourceMessages, 'buttons.resources.add', null);
    const defaultAddButtonLabel = isMessage(addButtonLabel) ? (
        <FormattedMessage {...addButtonLabel} values={{ name: resourceName }} />
    ) : (
        addButtonLabel
    );
    const finalAddButtonLabel = resourceAddButtonLabel || defaultAddButtonLabel;
    const addButton = showAddButton ? (
        <Button
            href={isTyped ? getResourceActionUrl('create') : null}
            dropdown={
                isTyped
                    ? types.map(({ id, label }) => ({
                          href: `${getResourceActionUrl('create')}?type=${id}`,
                          label,
                      }))
                    : null
            }
        >
            {isTyped ? (
                <Fragment>
                    {finalAddButtonLabel} <span className="caret" />
                </Fragment>
            ) : (
                finalAddButtonLabel
            )}
        </Button>
    ) : null;

    return (
        <div className={classNames(['py-4', styles.header])}>
            <div className={styles.cols}>
                <div className={styles.col}>
                    <h1 className={classNames([styles.title, 'mb-0', 'mt-0'])}>
                        {resourceTitle !== null ? resourceTitle : defaultTitle}
                    </h1>
                </div>
                <div className={classNames([styles.col, 'text-right'])}>{addButton}</div>
            </div>
        </div>
    );
};

ResourceIndexHeader.propTypes = propTypes;
ResourceIndexHeader.defaultProps = defaultProps;

export default ResourceIndexHeader;
