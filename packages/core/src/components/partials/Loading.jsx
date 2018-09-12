import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { keyframes, css } from 'emotion';

import styles from '../../styles/partials/loading.scss';

const propTypes = {
    loading: PropTypes.bool,
    color: PropTypes.string,
    size: PropTypes.number,
    margin: PropTypes.string,
    sizeUnit: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    loading: true,
    color: '#000000',
    size: 15,
    margin: '2px',
    sizeUnit: 'px',
    className: null,
};

class Loader extends PureComponent {
    style = (i) => {
        const {
            color, size, sizeUnit, margin,
        } = this.props;

        return {
            backgroundColor: ${color};
            width: ${`${size}${sizeUnit}`};
            height: ${`${size}${sizeUnit}`};
            margin: ${margin};
            animationDelay: i * 0.12,
        };
    };

    wrapper = () => {
        const { className } = this.props;
        const classNames = [styles.component];
        if (className !== null) {
            classNames.push(className);
        }
        return classNames.join(' ');
    };

    render() {
        const { loading } = this.props;

        return loading ? (
            <div className={this.wrapper()}>
                <div className={styles.dot} style={this.style(1)} />
                <div className={styles.dot} style={this.style(2)} />
                <div className={styles.dot} style={this.style(3)} />
            </div>
        ) : null;
    }
}

Loader.propTypes = propTypes;
Loader.defaultProps = defaultProps;

export default Loader;
