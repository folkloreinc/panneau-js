/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import get from 'lodash/get';
import isString from 'lodash/isString';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator, useDefinition } from '@panneau/core/contexts';
import { defineMessages } from 'react-intl';

import NavbarItem from './NavbarItem';

const messages = defineMessages({
    index: {
        id: 'layouts.navbar.resource.index',
        description: 'The label for a resource "index" navbar menu',
        defaultMessage: 'View all { resource }',
    },
    create: {
        id: 'layouts.navbar.resource.create',
        description: 'The label for a resource "create" navbar menu',
        defaultMessage: 'Create { resource }',
    },
});

const propTypes = {
    resource: PropTypes.string,
    href: PropTypes.string,
    label: PanneauPropTypes.label,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            label: PanneauPropTypes.label,
        }),
    ),
};

const defaultProps = {
    resource: null,
    href: null,
    label: null,
    items: [
        {
            type: 'action',
            action: 'index',
            label: messages.viewAll,
        },
        {
            type: 'divider',
        },
        {
            type: 'action',
            action: 'create',
            label: messages.addNew,
        },
    ],
};

export const NavbarResource = ({ resource: resourceId, href, label, items, ...props }) => {
    const urlGenerator = useUrlGenerator();
    const definition = useDefinition();
    const resource = definition.resource(resourceId);
    if (resource === null) {
        return null;
    }

    const finalLabel = resource.localizedName('plural');
    const finalHref =
        href || (urlGenerator !== null ? urlGenerator.resource(resource, 'index') : null);

    const actions = ['index', 'create'];
    const actionsLabels = actions.reduce((labels, action) => {
        const message = resource.message(`navbar.${action}`, messages[action]);
        return {
            ...labels,
            [action]: isString(message)
                ? message
                : {
                      ...message,
                      values: {
                          resource: resource.localizedName(action === 'index' ? 'a_plural' : 'a'),
                      },
                  },
        };
    }, {});

    const finalItems = (items || []).map(it =>
        get(it, 'type', 'link') === 'action'
            ? {
                  ...it,
                  label: it.label || get(actionsLabels, it.action, null),
                  href:
                      it.href ||
                      (urlGenerator !== null ? urlGenerator.resource(resource, it.action) : null),
              }
            : it,
    );
    return <NavbarItem {...props} href={finalHref} label={finalLabel} items={finalItems} />;
};

NavbarResource.propTypes = propTypes;
NavbarResource.defaultProps = defaultProps;

export default NavbarResource;
