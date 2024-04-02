/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { useDisplaysComponentsManager } from '@panneau/core/contexts';

import defaultMetadata from './metadata';

const propTypes = {
    value: PropTypes.shape({
        metadata: PropTypes.shape({}),
        user: PropTypes.shape({}),
        createdAt: PropTypes.string,
    }),
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.node,
            items: PropTypes.arrayOf(PropTypes.shape({})), // displays
        }),
    ),
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    sections: defaultMetadata,
    className: null,
};

function MediaMetadata({ sections, value, className }) {
    const displayComponents = useDisplaysComponentsManager();

    return (
        <div className={classNames(['px-2', { [className]: className !== null }])}>
            {(sections || []).map(({ title, items }, i) => (
                <div className="mb-5" key={`section-${i + 1}`}>
                    <h6 className="px-1">{title}</h6>
                    <ul className="list-group list-group-flush">
                        {(items || []).map(({ label, path, component = null, ...props }, index) => {
                            const Component = displayComponents.getComponent(component || 'text');
                            const itemValue = get(value, path, null);
                            return Component !== null && itemValue !== null ? (
                                <li
                                    className={classNames([
                                        'row',
                                        'd-flex',
                                        'align-items-center',
                                        'justify-content-between',
                                        'p-1',
                                        'border-secondary-1',
                                        'border-1',
                                        'border-bottom',
                                        'text-small',
                                        { 'border-top': index === 0 },
                                    ])}
                                    key={`item-${index + 1}`}
                                >
                                    <div className="col-auto">{label}</div>
                                    <div className="col-auto align-right">
                                        <Component {...props} value={itemValue} />
                                    </div>
                                </li>
                            ) : null;
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

MediaMetadata.propTypes = propTypes;
MediaMetadata.defaultProps = defaultProps;

export default MediaMetadata;
