import Loadable from 'react-loadable';

export const DayPickerRangeController = Loadable({
    loader: () => import('react-dates/lib/components/DayPickerRangeController'),
    loading: () => null,
});

export const DayPickerSingleDateController = Loadable({
    loader: () => import('react-dates/lib/components/DayPickerSingleDateController'),
    loading: () => null,
});
