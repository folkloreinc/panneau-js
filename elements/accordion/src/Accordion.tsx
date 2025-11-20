import classNames from 'classnames';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import styles from './styles.module.css';

interface AccordionItem {
    label?: string;
    content?: ReactNode | string;
}

interface AccordionProps {
    items?: AccordionItem[];
    oneAtATime?: boolean;
    title?: string | null;
    className?: string | null;
}

const DEFAULT_ITEMS: AccordionItem[] = [];

function Accordion({
    oneAtATime = false,
    title = null,
    items = DEFAULT_ITEMS,
    className = null,
}: AccordionProps) {
    const accordionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const accordionId = useMemo(() => uuid(), []);

    const accordionItemsHeights = items.map((it, idx) =>
        accordionRefs.current[idx]
            ? `${accordionRefs.current[idx]!.getBoundingClientRect().height}px`
            : null,
    );

    const [openedItem, setOpenedItem] = useState<number | null>(null);
    const [openedItems, setOpenedItems] = useState(items.map(() => false));

    const isItemOpened = useCallback(
        (idx: number) => openedItem === idx || openedItems[idx] === true,
        [openedItem, openedItems],
    );

    const openItem = useCallback(
        (idx: number) => {
            if (oneAtATime) {
                const valueToUpdate = idx !== openedItem ? idx : null;
                setOpenedItem(valueToUpdate);
            } else {
                const openItempsUpdated = openedItems.slice();
                openItempsUpdated[idx] = !openItempsUpdated[idx];
                setOpenedItems(openItempsUpdated);
            }
        },
        [openedItem, openedItems, setOpenedItem, setOpenedItems, oneAtATime],
    );

    return (
        <div
            className={classNames([
                styles.container,
                'accordion',
                {
                    [className!]: className !== null,
                },
            ])}
            id={accordionId}
        >
            {title !== null ? <h3>{title}</h3> : null}
            {items.length > 0
                ? items.map((it, idx) => {
                      const itemOpened = isItemOpened(idx);
                      const { label = null, content = null } = it || {};
                      return (
                          <div className="accordion-item" key={`acc-${idx + 1}`}>
                              <h2
                                  className="accordion-header"
                                  id={`${accordionId}-${label}-${idx + 1}`}
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
                                      {label}
                                  </button>
                              </h2>
                              <div
                                  id={`${accordionId}-collapse${idx}`}
                                  className={classNames([
                                      'accordion-item collapse show',
                                      styles.accordeonItem,
                                  ])}
                                  aria-labelledby={`${accordionId}-${label}-${idx + 1}`}
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
                                      {content}
                                  </div>
                              </div>
                          </div>
                      );
                  })
                : null}
        </div>
    );
}

export default Accordion;
