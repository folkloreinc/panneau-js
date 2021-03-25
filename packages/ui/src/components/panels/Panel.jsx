/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';

import { getDisplayName } from '../../utils';
import Portal from './Portal';

import styles from '../../styles/panels/panel.module.scss';

const propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    id: null,
    title: null,
    children: null,
};

const Panel = ({ id, children, title }) => {
    const finalId = useMemo(() => id || getDisplayName(children.type), [id, children.type]);
    const data = useMemo(
        () => ({
            title,
        }),
        [title],
    );
    return (
        <Portal id={finalId} data={data}>
            <div className={styles.container}>{children}</div>
        </Portal>
    );
};

Panel.propTypes = propTypes;
Panel.defaultProps = defaultProps;

export default Panel;
