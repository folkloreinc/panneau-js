/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { useDisplaysComponentsManager } from '@panneau/core/contexts';

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
    displays: PropTypes.arrayOf(
        PropTypes.shape({
            section: PropTypes.string,
        }),
    ),
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    sections: null,
    displays: null,
    className: null,
};

function MediaMetadata({ sections, displays, value: filtersValue, className }) {
    const displayComponents = useDisplaysComponentsManager();

    const finalSections = useMemo(() => {
        const displaysWithValue = (displays || [])
            .map(({ path = null, ...props }) => ({
                value: get(filtersValue, path, null),
                ...props,
            }))
            .filter(({ value = null }) => value !== null);
        const displaysWithoutSection = (displaysWithValue || []).filter(
            ({ section = null }) => section === null,
        );
        return (sections || [])
            .map(({ id = null, title = null }) => ({
                id,
                title,
                items: (displaysWithValue || []).filter(({ section = null }) => section === id),
            }))
            .concat({ id: 'others', title: null, items: displaysWithoutSection })
            .filter(({ items = null }) => items !== null && items.length > 0);
    }, [sections, displays, filtersValue]);

    return (
        <div className={classNames(['px-2', { [className]: className !== null }])}>
            {(finalSections || []).map(({ title = null, items = [] }, idx) => (
                <div
                    className={idx < finalSections.length - 1 ? 'mb-5' : null}
                    key={`section-${idx + 1}`}
                >
                    {title !== null ? <h6 className="px-1">{title}</h6> : null}
                    <ul className="list-group list-group-flush">
                        {(items || []).map(
                            ({ label, value, component = null, ...props }, index) => {
                                const Component = displayComponents.getComponent(
                                    component || 'text',
                                );
                                const itemValue = value || null;
                                return Component !== null && itemValue !== null ? (
                                    <li
                                        key={`item-${index + 1}`}
                                        className={classNames([
                                            'row',
                                            'd-flex',
                                            'align-items-center',
                                            'justify-content-between',
                                            'p-0',
                                            'border-secondary-1',
                                            'border-top',
                                            'border-bottom',
                                            'text-small',
                                            // { 'border-top': index === 0 },
                                        ])}
                                    >
                                        <div className="col-auto">{label}</div>
                                        <div className="col-auto align-right">
                                            <Component {...props} value={itemValue} />
                                        </div>
                                    </li>
                                ) : null;
                            },
                        )}
                    </ul>
                </div>
            ))}
        </div>
    );
}

MediaMetadata.propTypes = propTypes;
MediaMetadata.defaultProps = defaultProps;

export default MediaMetadata;
