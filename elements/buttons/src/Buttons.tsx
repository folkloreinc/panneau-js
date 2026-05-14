import classNames from 'classnames';
import isString from 'lodash/isString';
import type { MouseEvent, ReactNode } from 'react';

import type { ButtonElement, ButtonSize, ButtonTheme, Button as ButtonType } from '@panneau/core';
import { useButtonsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

interface ButtonsProps {
    items?: ButtonType[];
    size?: ButtonSize | null;
    theme?: ButtonTheme | null;
    outline?: boolean;
    renderButton?:
        | ((button: ButtonType, index: number, fixedProps: Record<string, unknown>) => ReactNode)
        | null;
    onClickButton?:
        | ((e: MouseEvent<ButtonElement>, button: ButtonType, index: number) => void)
        | null;
    className?: string | null;
    buttonClassName?: string | null;
}

function Buttons({
    items = null,
    size = null,
    theme = null,
    outline = false,
    renderButton = null,
    onClickButton = null,
    buttonClassName = null,
    className = null,
}: ButtonsProps) {
    const componentsManager = useButtonsComponentsManager();

    return (
        <div
            className={classNames([
                'btn-group',
                size !== null ? `btn-group-${size}` : null,
                className,
            ])}
            role="group"
        >
            {(items || []).map((button, index) => {
                const {
                    className: customClassName = null,
                    onClick = null,
                    renderButton: customRenderButton = null,
                    component = null,
                    ...buttonProps
                } = (button as ButtonType) || {};

                const fixedProps = {
                    key: `button-${index}`,
                    className: classNames([buttonClassName, customClassName]),
                    theme,
                    outline,
                    onClick: (e: MouseEvent<ButtonElement>) => {
                        if (onClick !== null) {
                            onClick(e, button, index);
                        }
                        if (onClickButton !== null) {
                            onClickButton(e, button, index);
                        }
                    },
                };

                const ButtonComponent =
                    component !== null && isString(component)
                        ? componentsManager.getComponent(component)
                        : component;

                if (ButtonComponent !== null) {
                    return <ButtonComponent {...fixedProps} {...buttonProps} />;
                }
                const finalRenderButton = customRenderButton || renderButton;
                if (finalRenderButton) {
                    return finalRenderButton(button, index, fixedProps);
                }

                return <Button {...fixedProps} {...buttonProps} />;
            })}
        </div>
    );
}

export default Buttons;
