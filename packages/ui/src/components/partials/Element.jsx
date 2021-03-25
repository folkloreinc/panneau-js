/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import { pascalCase } from '@panneau/core';
import PlaceholderBlock from './PlaceholderBlock';

// import { PropTypes as PanneauPropTypes } from '@/core';

const propTypes = {
    name: PropTypes.string.isRequired,
    components: PropTypes.object.isRequired, // eslint-disable-line
    props: PropTypes.object, // eslint-disable-line
    isPlaceholder: PropTypes.bool,
    className: PropTypes.string,
    placeholderProps: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    props: {},
    isPlaceholder: false,
    className: null,
    placeholderProps: null,
};

const ElementComponent = ({
    name,
    components,
    props,
    isPlaceholder,
    className,
    placeholderProps,
}) => {
    if (!name) {
        return 'Bad component name';
    }

    if (isPlaceholder) {
        // TODO: figure out what this did
        // const PlaceholderComponent = Placeholders[pascalCase(name)];
        return <PlaceholderBlock {...placeholderProps} />;
    }

    const RealComponent = components[pascalCase(name)];

    if (!RealComponent) {
        return 'Bad component';
    }

    return <RealComponent {...props} className={className} />;
};

ElementComponent.propTypes = propTypes;
ElementComponent.defaultProps = defaultProps;

export default ElementComponent;
