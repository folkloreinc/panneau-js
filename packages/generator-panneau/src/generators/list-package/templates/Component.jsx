import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    pagination: PropTypes.bool,
};

const defaultProps = {
    items: [],
    pagination: true,
};

class <%= componentName %> extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    renderItem(it, index) {
        const itemClassNames = classNames({
            [styles.item]: true,
        });

        return (
            <div
                key={`item-${index}`}
                classNames={itemClassNames}
            >

            </div>
        );
    }

    render() {
        const {
            items,
            ...other
        } = this.props;

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        const itemsClassNames = classNames({
            [styles.items]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className={itemsClassNames}>
                    { items.map(this.renderItem) }
                </div>
            </div>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
