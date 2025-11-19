/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import React from 'react';

interface ProgressProps {
    className?: string | null;
}

function Progress({
    className = null
}: ProgressProps) {
    return (
    <div
        className={classNames([
            'progress',
            {
                [className!]: className !== null,
            },
        ])}
    >
        <div
            className="progress-bar"
            role="progressbar"
            style={{ width: '15%' }}
            aria-valuenow={15}
            aria-valuemin={0}
            aria-valuemax={100}
        />
        <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: '30%' }}
            aria-valuenow={30}
            aria-valuemin={0}
            aria-valuemax={100}
        />
        <div
            className="progress-bar bg-info"
            role="progressbar"
            style={{ width: '20%' }}
            aria-valuenow={20}
            aria-valuemin={0}
            aria-valuemax={100}
        />
    </div>
    );
}

export default Progress;
