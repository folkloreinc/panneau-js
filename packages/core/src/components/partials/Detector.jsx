/* eslint-disable react/no-danger */
import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import { useIntersectionObserver } from '../../hooks';

const propTypes = {
    throttleDelay: PropTypes.number,
    threshold: PropTypes.arrayOf(PropTypes.number),
    onEnter: PropTypes.func,
    onLeave: PropTypes.func,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
};

const defaultProps = {
    throttleDelay: null,
    threshold: undefined,
    onEnter: null,
    onLeave: null,
    onChange: null,
    disabled: false,
    children: null,
    className: null,
};

const Detector = ({
    throttleDelay,
    threshold,
    onEnter,
    onLeave,
    onChange,
    disabled,
    children,
    className,
}) => {
    const {
        ref,
        entry: { isIntersecting },
    } = useIntersectionObserver({
        threshold,
    });
    const enteredRef = useRef(false);

    const triggerChange = useMemo(() => {
        const callback = (intersecting) => {
            const { current: entered } = enteredRef;
            if (onEnter !== null && intersecting && !entered) {
                onEnter();
            }
            if (onLeave !== null && !intersecting && entered) {
                onLeave();
            }
            if (onChange !== null) {
                onChange(intersecting);
            }
            if (intersecting && !entered) {
                enteredRef.current = true;
            } else if (!intersecting && entered) {
                enteredRef.current = false;
            }
        };
        return throttleDelay !== null
            ? throttle(callback, throttleDelay, {
                  trailing: true,
                  leading: true,
              })
            : callback;
    }, [throttleDelay, onEnter, onLeave, onChange]);

    useEffect(() => {
        if (disabled) {
            return () => {};
        }
        triggerChange(isIntersecting);
        return () => {
            if (throttleDelay !== null) {
                triggerChange.cancel();
            }
        };
    }, [throttleDelay, isIntersecting, disabled, triggerChange]);

    return (
        <div className={className} ref={ref}>
            {children}
        </div>
    );
};

Detector.propTypes = propTypes;
Detector.defaultProps = defaultProps;

export default Detector;
