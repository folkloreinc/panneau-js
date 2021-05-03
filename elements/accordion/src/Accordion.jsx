import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { v4 as uuid } from 'uuid';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import Label from '@panneau/element-label';

import styles from './styles.module.scss';

const propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            content: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
        }),
    ),
    oneAtATime: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    items: [],
    oneAtATime: false,
    title: null,
    className: null,
};

const Accordion = ({ oneAtATime, title, items, className }) => {
    const accordionRefs = useRef([]);
    const accordionId = useMemo(() => uuid(), []);

    const accordionItemsHeights = items.map((it, idx) =>
        accordionRefs.current[idx]
            ? `${accordionRefs.current[idx].getBoundingClientRect().height}px`
            : null,
    );

    const [openedItem, setOpenedItem] = useState(null);
    const [openedItems, setOpenedItems] = useState(items.map(() => false));

    const isItemOpened = useCallback(
        (idx) => {
            return openedItem === idx || openedItems[idx] === true;
        },
        [items, oneAtATime, openedItem, openedItems],
    );

    const openItem = useCallback(
        (idx) => {
            if (oneAtATime) {
                const valueToUpdate = idx !== openedItem ? idx : null;
                setOpenedItem(valueToUpdate);
            } else {
                const openItempsUpdated = openedItems.slice();
                openItempsUpdated[idx] = !openItempsUpdated[idx];
                setOpenedItems(openItempsUpdated);
            }
        },
        [openedItem, openedItems, setOpenedItem, setOpenedItems],
    );

    return (
        <div
            className={classNames([
                styles.container,
                'accordion',
                {
                    [className]: className !== null,
                },
            ])}
            id={accordionId}
        >
            {title !== null ? <h3>{title}</h3> : null}
            {items.length > 0
                ? items.map((it, idx) => {
                      const itemOpened = isItemOpened(idx);
                      return (
                          <div className="accordion-item">
                              <h2
                                  className="accordion-header"
                                  id={`${accordionId}-${it.label}-${idx + 1}`}
                              >
                                  <button
                                      className={`accordion-button ${
                                          itemOpened ? '' : 'collapsed'
                                      }`}
                                      type="button"
                                      onClick={() => openItem(idx)}
                                      aria-expanded="true"
                                      aria-controls={`${accordionId}-collapse${idx}`}
                                  >
                                      {it.label}
                                  </button>
                              </h2>
                              <div
                                  id={`${accordionId}-collapse${idx}`}
                                  className={classNames([
                                      'accordion-item collapse show',
                                      styles.accordeonItem,
                                  ])}
                                  aria-labelledby={`${accordionId}-${it.label}-${idx + 1}`}
                                  data-bs-parent={`#${accordionId}`}
                                  style={{
                                      height: `${itemOpened ? accordionItemsHeights[idx] : '0'}`,
                                  }}
                              >
                                  <div
                                      className="accordion-body"
                                      ref={(ref) => {
                                          accordionRefs.current[idx] = ref;
                                      }}
                                  >
                                      {it.content}
                                  </div>
                              </div>
                          </div>
                      );
                  })
                : null}
        </div>
    );
};

Accordion.propTypes = propTypes;
Accordion.defaultProps = defaultProps;

export default Accordion;
