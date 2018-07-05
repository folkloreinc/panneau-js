import React from 'react';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const getColumnProps = column => pick(column, ['width', 'colspan', 'rowspan', 'title', 'height', 'valign']);

const propTypes = {
    width: PropTypes.number,
    head: PropTypes.bool,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    verticalAlign: PropTypes.oneOf(['middle', 'top', 'bottom']),
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    width: null,
    head: false,
    align: null,
    verticalAlign: 'middle',
    className: null,
    children: null,
};

const Column = ({
    children, head, className, align, verticalAlign, ...props
}) => {
    const ColumnComponent = head ? 'th' : 'td';
    return (
        <ColumnComponent
            className={classNames({
                [`align-${verticalAlign}`]: true,
                [`text-${align}`]: align !== null,
                [className]: className !== null,
            })}
            {...getColumnProps(props)}
        >
            {children}
        </ColumnComponent>
    );
};

Column.propTypes = propTypes;
Column.defaultProps = defaultProps;

export default Column;
