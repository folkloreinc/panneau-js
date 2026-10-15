import Actions, { type ActionsProps } from '@panneau/action-actions';
import { Item } from '@panneau/core';

interface ActionsDisplayProps extends ActionsProps {
    item?: Item;
    className?: string | null;
    buttonsClassName?: string | null;
}

function ActionsDisplay({
    item,
    value: displayValue = null,
    className = null,
    buttonsClassName = null,
    isDropdown = false,
    ...props
}: ActionsDisplayProps) {
    return (
        <div className={className}>
            <Actions
                value={displayValue || item}
                className={buttonsClassName}
                isGroup={!isDropdown}
                isDropdown={isDropdown}
                dropdownAlign="end"
                iconsOnly={!isDropdown}
                {...props}
            />
        </div>
    );
}

export default ActionsDisplay;
