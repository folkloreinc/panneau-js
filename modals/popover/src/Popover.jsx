import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Popper from 'popper.js';

import OutsideClickHandler from './OutsideClickHandler';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
    closable: PropTypes.bool,
    visible: PropTypes.bool,
    closeOnBlur: PropTypes.bool,
    noUi: PropTypes.bool,
    noArrow: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
    blurElement: PropTypes.instanceOf(Element),
    element: PropTypes.instanceOf(Element),
    elementPlacement: PropTypes.string,
    offsetX: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    offsetY: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClose: PropTypes.func,
};

const defaultProps = {
    closable: true,
    visible: false,
    title: null,
    closeOnBlur: false,
    noUi: false,
    noArrow: false,
    className: null,
    blurElement: null,
    element: null,
    elementPlacement: 'bottom',
    offsetX: 0,
    offsetY: 0,
    onClose: null,
};

class Popover extends Component {
    constructor(props) {
        super(props);

        this.onOutsideClick = this.onOutsideClick.bind(this);
        this.updatePopoverStyle = this.updatePopoverStyle.bind(this);

        this.popper = null;
        this.refPopover = null;
        this.refArrow = null;

        this.state = {
            placement: props.elementPlacement,
            popoverStyles: null,
            arrowStyles: null,
        };
    }

    componentDidMount() {
        const { element } = this.props;
        if (element !== null) {
            this.popper = this.createPopper(element);
        }
    }

    componentDidUpdate({
        element: prevElement,
        visible: prevVisible,
    }) {
        const { element, visible } = this.props;
        const elementChanged = element !== prevElement;
        if (elementChanged) {
            if (this.popper !== null) {
                this.popper.destroy();
            }
            this.popper = this.createPopper(element);
        }

        const visibleChanged = visible !== prevVisible;
        if (visibleChanged && visible) {
            this.popper.scheduleUpdate();
        }
    }

    componentWillUnmount() {
        if (this.popper !== null) {
            this.popper.destroy();
            this.popper = null;
        }
    }

    onOutsideClick(e) {
        const { onClose } = this.props;
        if (onClose !== null) {
            onClose(e);
        }
    }

    createPopper(element) {
        const { elementPlacement, offsetX, offsetY } = this.props;
        const popper = new Popper(element, this.refPopover, {
            placement: elementPlacement,
            modifiers: {
                offset: {
                    enabled: true,
                    offset: `${offsetY},${offsetX}`,
                },
                arrow: {
                    enabled: this.refArrow !== null,
                    element: this.refArrow || null,
                },
                applyStyle: {
                    enabled: false,
                },
                applyReactStyle: {
                    enabled: true,
                    fn: this.updatePopoverStyle,
                    order: 900,
                },
            },
        });
        return popper;
    }

    updatePopoverStyle(data) {
        this.setState(() => ({
            placement: data.placement,
            popoverStyles: data.styles,
            arrowStyles: data.arrowStyles,
        }));
    }

    renderPopover() {
        const {
            title,
            className,
            children,
            noUi,
            noArrow,
            visible,
        } = this.props;

        const { placement, popoverStyles, arrowStyles } = this.state;

        const popoverClassName = classNames({
            popover: !noUi,
            [styles.popover]: true,
            bottom: placement === 'bottom',
            top: placement === 'top',
            left: placement === 'left',
            right: placement === 'right',
            [className]: className !== null,
        });

        const style = {
            display: visible ? 'block' : 'none',
            ...popoverStyles,
        };

        return (
            <div
                className={popoverClassName}
                style={style}
                ref={(ref) => { this.refPopover = ref; }}
            >
                { !noUi && !noArrow ? (
                    <div
                        className="arrow"
                        style={arrowStyles}
                        ref={(ref) => { this.refArrow = ref; }}
                    />
                ) : null }
                { title !== null ? (
                    <h3 className="popover-title">{ title }</h3>
                ) : null }
                { !noUi ? (
                    <div className="popover-content">
                        { children }
                    </div>
                ) : children }
            </div>
        );
    }

    render() {
        const { closable, closeOnBlur, blurElement } = this.props;

        const popover = this.renderPopover();

        return closable && closeOnBlur ? (
            <OutsideClickHandler
                root={blurElement}
                onOutsideClick={this.onOutsideClick}
            >
                { popover }
            </OutsideClickHandler>
        ) : popover;
    }
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default Popover;
