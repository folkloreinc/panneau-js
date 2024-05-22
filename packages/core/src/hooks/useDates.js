import dayjs from 'dayjs';
import isString from 'lodash-es/isString';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

export const useFormattedDate = ({ format = null, showToday = true } = {}) => {
    const intl = useIntl();
    const today = dayjs();

    return useCallback(
        (date) => {
            const dateToFormat = isString(date) ? dayjs(date) : date;

            if (showToday && dateToFormat.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) {
                return intl.formatMessage({
                    defaultMessage: 'Today',
                    description: 'Today date message',
                });
            }

            return intl.formatDate(dayjs(date).toDate(), {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                ...format,
            });
        },
        [today, showToday, format],
    );
};

export const useFormattedTime = ({ format = null, showNow = true, timeGap = 2 } = {}) => {
    const intl = useIntl();
    const now = dayjs();

    return useCallback(
        (date) => {
            const dateToFormat = isString(date) ? dayjs(date) : date;

            if (
                showNow &&
                dateToFormat.format('YYYY-MM-DD') === now.format('YYYY-MM-DD') &&
                dateToFormat.hour() === now.hour() &&
                dateToFormat.minute() > now.minute() - timeGap &&
                dateToFormat.minute() < now.minute() + timeGap
            ) {
                return intl.formatMessage({
                    defaultMessage: 'Now',
                    description: 'Now date time message',
                });
            }

            return intl.formatTime(dateToFormat.toDate(), {
                hour: 'numeric',
                minute: 'numeric',
                ...format,
            });
        },
        [now, showNow, timeGap, format],
    );
};
