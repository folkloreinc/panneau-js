import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import UrlGenerator from './UrlGenerator';

const propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    routes: PropTypes.objectOf(PropTypes.string),
    getRoutes: PropTypes.func,
    /* eslint-enable react/no-unused-prop-types */
    children: PropTypes.node,
};

const defaultProps = {
    routes: {},
    getRoutes: null,
    children: null,
};

const childContextTypes = {
    urlGenerator: PropTypes.instanceOf(UrlGenerator),
};

class UrlGeneratorContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            urlGenerator: new UrlGenerator(this.getRoutes()),
        };
    }

    getChildContext() {
        const { urlGenerator } = this.state;
        return {
            urlGenerator,
        };
    }

    componentWillReceiveProps(nextProps) {
        const nextRoutes = this.getRoutes(nextProps);
        const routes = this.getRoutes();
        if (!isEqual(nextRoutes, routes)) {
            this.setState({
                urlGenerator: new UrlGenerator(nextRoutes),
            });
        }
    }

    getRoutes(props) {
        const { getRoutes, routes } = props || this.props;
        return getRoutes !== null ? getRoutes() : routes;
    }

    render() {
        const { children } = this.props;
        return children;
    }
}

UrlGeneratorContainer.propTypes = propTypes;
UrlGeneratorContainer.defaultProps = defaultProps;
UrlGeneratorContainer.childContextTypes = childContextTypes;

export default UrlGeneratorContainer;
