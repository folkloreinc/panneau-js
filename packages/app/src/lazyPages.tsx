import { type ComponentProps, Suspense, lazy } from 'react';

import { AuthSkeleton } from './auth/AuthLayout';
import type { LoginPage as LoginPageComponent } from './auth/LoginPage';
import type { ResetPasswordPage as ResetPasswordPageComponent } from './auth/ResetPasswordPage';
import type { TwoFactorRequiredPage as TwoFactorRequiredPageComponent } from './auth/TwoFactorRequiredPage';
import type {
    EmailVerificationLinkPage as EmailVerificationLinkPageComponent,
    VerifyEmailPage as VerifyEmailPageComponent,
} from './auth/VerifyEmailPage';
import type { AccountPage as AccountPageComponent } from './pages/AccountPage';
import { PageSkeleton } from './pages/PageSkeleton';

// The pages off the path of lists and forms load on first use, with the skeleton of their shape
// while their code loads (#346): the auth pages and the account page. The components below take
// the props of the pages they load. The dashboards stay in the bundle: the summaries above lists
// show their widgets.

const LazyLoginPage = lazy(async () => ({
    default: (await import('./auth/LoginPage')).LoginPage,
}));
const LazyResetPasswordPage = lazy(async () => ({
    default: (await import('./auth/ResetPasswordPage')).ResetPasswordPage,
}));
const LazyTwoFactorRequiredPage = lazy(async () => ({
    default: (await import('./auth/TwoFactorRequiredPage')).TwoFactorRequiredPage,
}));
const LazyVerifyEmailPage = lazy(async () => ({
    default: (await import('./auth/VerifyEmailPage')).VerifyEmailPage,
}));
const LazyEmailVerificationLinkPage = lazy(async () => ({
    default: (await import('./auth/VerifyEmailPage')).EmailVerificationLinkPage,
}));
const LazyAccountPage = lazy(async () => ({
    default: (await import('./pages/AccountPage')).AccountPage,
}));

export function LoginPage(props: ComponentProps<typeof LoginPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyLoginPage {...props} />
        </Suspense>
    );
}

export function ResetPasswordPage(props: ComponentProps<typeof ResetPasswordPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyResetPasswordPage {...props} />
        </Suspense>
    );
}

export function TwoFactorRequiredPage(
    props: ComponentProps<typeof TwoFactorRequiredPageComponent>,
) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyTwoFactorRequiredPage {...props} />
        </Suspense>
    );
}

export function VerifyEmailPage(props: ComponentProps<typeof VerifyEmailPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyVerifyEmailPage {...props} />
        </Suspense>
    );
}

export function EmailVerificationLinkPage(
    props: ComponentProps<typeof EmailVerificationLinkPageComponent>,
) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyEmailVerificationLinkPage {...props} />
        </Suspense>
    );
}

export function AccountPage(props: ComponentProps<typeof AccountPageComponent>) {
    return (
        <Suspense fallback={<PageSkeleton width="narrow" />}>
            <LazyAccountPage {...props} />
        </Suspense>
    );
}
