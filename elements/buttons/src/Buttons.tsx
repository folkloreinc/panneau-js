import classNames from 'classnames';
import isArray from 'lodash/isArray';
import type { MouseEvent, ReactNode } from 'react';

import type { ButtonSize, Button as ButtonType } from '@panneau/core';
import { useButtonsComponents } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

interface ButtonsProps {
    items?: ButtonType[];
    size?: ButtonSize;
    theme?: string | null;
    outline?: boolean;
    renderButton?: ((button: ButtonType, index: number, fixedProps: any) => ReactNode) | null;
    onClickButton?: ((e: MouseEvent, button: ButtonType, index: number) => void) | null;
    className?: string | null;
    buttonClassName?: string | null;
}

const DEFAULT_ITEMS: ButtonType[] = [];

function Buttons({
    items = DEFAULT_ITEMS,
    size = null,
    theme = null,
    outline = false,
    renderButton = null,
    onClickButton = null,
    buttonClassName = null,
    className = null,
}: ButtonsProps) {
    const componentsManager = useButtonsComponents();

    return (
        <div
            className={classNames([
                'btn-group',
                {
                    [`btn-group-${size}`]: size !== null,
                },
                {
                    [className!]: className !== null,
                },
            ])}
            role="group"
            style={{ zIndex: 0 }}
        >
            {isArray(items)
                ? items.map((button, index) => {
                      const {
                          className: customClassName = null,
                          onClick = null,
                          renderButton: customRenderButton = null,
                          component = null,
                          ...buttonProps
                      } = (button as any) || {};

                      const fixedProps = {
                          key: `button-${index}`,
                          className: classNames([
                              {
                                  [buttonClassName!]: buttonClassName !== null,
                                  [customClassName]: customClassName !== null,
                              },
                          ]),
                          theme,
                          outline,
                          onClick: (e: MouseEvent) => {
                              if (onClick !== null) {
                                  onClick(e, button, index);
                              }
                              if (onClickButton !== null) {
                                  onClickButton(e, button, index);
                              }
                          },
                      };

                      const ButtonComponent =
                          component !== null ? componentsManager.getComponent(component) : null;

                      if (ButtonComponent !== null) {
                          return <ButtonComponent {...fixedProps} {...buttonProps} />;
                      }
                      const finalRenderButton = customRenderButton || renderButton;
                      if (finalRenderButton) {
                          return finalRenderButton(button, index, fixedProps);
                      }

                      return <Button {...fixedProps} {...buttonProps} />;
                  })
                : null}
        </div>
    );
}

export default Buttons;
