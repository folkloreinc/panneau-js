import { withKnobs } from '@storybook/addon-knobs';
import withIntlProvider from './decorators/withIntlProvider';
import withGoogleKeys from './decorators/withGoogleKeys';
import withAuthProvider from './decorators/withAuthProvider';
import withRoutesProvider from './decorators/withRoutesProvider';

import '../packages/themes/src/styles/vendor.scss';

// import './fonts/fonts.scss';

export const parameters = {
    viewport: {
        viewports: {
            mobileSmall: {
                name: 'Very small (iPhone5)',
                styles: {
                    width: '320px',
                    height: '568px',
                },
            },
            mobileMedium: {
                name: 'Very small (iPhoneX)',
                styles: {
                    width: '375px',
                    height: '632px',
                },
            },
            mobileLarge: {
                name: 'Small (mobile)',
                styles: {
                    width: '500px',
                    height: '800px',
                },
            },
            tabletSmall: {
                name: 'Medium (iPad - portrait)',
                styles: {
                    width: '768px',
                    height: '1024px',
                },
            },
            tabletLandscape: {
                name: 'Medium (iPad - landscape)',
                styles: {
                    width: '1024px',
                    height: '768px',
                },
            },
            desktopSmall: {
                name: 'Small (desktop)',
                styles: {
                    width: '980px',
                    height: '550px',
                },
            },
            desktopMedium: {
                name: 'Medium (desktop)',
                styles: {
                    width: '1200px',
                    height: '650px',
                },
            },
            desktopLarge: {
                name: 'Large (desktop)',
                styles: {
                    width: '1600px',
                    height: '1000px',
                },
            },
        },
    },
};

export const decorators = [
    withKnobs,
    withIntlProvider,
    withGoogleKeys,
    withRoutesProvider,
    withAuthProvider,
];
