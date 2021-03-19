/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/partials/slideshow.module.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.node),
    auto: PropTypes.bool,
    delay: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    items: [],
    auto: true,
    delay: 5000,
    width: null,
    height: null,
    className: null,
    children: null,
};

const Slideshow = ({ items, auto, delay, width, height, className, children }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        let id = null;
        if (auto) {
            id = setTimeout(() => {
                if (index < items.length - 1) {
                    setIndex((i) => i + 1);
                } else {
                    setIndex(0);
                }
            }, delay);
        }
        return () => {
            clearTimeout(id);
        };
    }, [index, items, auto, delay]);

    const style = { width, height };

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className,
                },
            ])}
            style={style}
        >
            <div className={styles.items}>
                {items.map((it, i) => (
                    <div
                        key={`slide-${i + 1}`}
                        className={classNames([
                            styles.item,
                            {
                                [styles.prev]: i < index,
                                [styles.current]: i === index,
                                [styles.next]: i > index,
                            },
                        ])}
                    >
                        {it}
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
};

Slideshow.propTypes = propTypes;
Slideshow.defaultProps = defaultProps;

export default Slideshow;
